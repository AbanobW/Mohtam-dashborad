/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactQuill from "react-quill";
import { useAuth } from "../auth";

type Props = {
	className: string;
};

type Section = {
	order: number;
	content: string;
	fileId: string | null;
};

type Article = {
	[x: string]: string;
	id: string;
	title: string;
	summary: string;
	coverImageId: string;
	sections: Section[];
	subjectId: string;
};

type Subject = {
	id: string;
	title: string;
};

const EditArticlesForm: React.FC<Props> = ({ className }) => {
	const { auth } = useAuth();
	const authToken = auth?.accessToken;
	const location = useLocation();
	const navigate = useNavigate();
	const articleData = location.state?.item as Article;
	const [title, setTitle] = useState<string>(articleData?.title || "");
	const [summary, setSummary] = useState<string>(articleData?.summary || "");
	const [coverImageId, setCoverImageId] = useState<string>(
		articleData?.coverImageId || ""
	);
	const [coverImageUrl, setCoverImageUrl] = useState<string>("");
	const [subjectId, setSubjectId] = useState<string>(
		articleData?.subjectId || ""
	);
	const [sections, setSections] = useState<Section[]>(
		articleData?.sections || [{ order: 0, content: "", fileId: null }]
	);
	const [sectionImageUrls, setSectionImageUrls] = useState<string[]>([]);
	const [subjects, setSubjects] = useState<Subject[]>([]);

	useEffect(() => {
		const fetchSubjects = async () => {
			try {
				const response = await fetch(
					"http://167.172.165.109:8080/api/v1/subjects",{
						headers: {
							Authorization: `Bearer ${authToken}`,
							"Content-Type": "application/json",
						},
					}
				);
				const data = await response.json();
				setSubjects(data.items || []);
			} catch (error) {
				console.error("Error fetching subjects:", error);
				toast.error("Failed to fetch subjects.");
			}
		};

		const fetchCoverImageUrl = async () => {
			if (coverImageId) {
				try {
					const response = await fetch(
						`http://167.172.165.109:8080/api/v1/presignedurls/${coverImageId}`,{
							headers: {
								Authorization: `Bearer ${authToken}`,
								"Content-Type": "application/json",
							},
						}
					);
					const data = await response.json();
					setCoverImageUrl(data.presignedUrl);
				} catch (error) {
					console.error("Error fetching cover image URL:", error);
					toast.error("Failed to fetch cover image URL.");
				}
			}
		};

		const fetchSectionImageUrls = async () => {
			const urls = await Promise.all(
				sections.map(async (section) => {
					if (section.fileId) {
						try {
							const response = await fetch(
								`http://167.172.165.109:8080/api/v1/presignedurls/${section.fileId}`,{
									headers: {
										Authorization: `Bearer ${authToken}`,
										"Content-Type": "application/json",
									},
								}
							);
							const data = await response.json();
							return data.presignedUrl;
						} catch (error) {
							console.error("Error fetching section image URL:", error);
							return "";
						}
					}
					return "";
				})
			);
			setSectionImageUrls(urls);
		};

		fetchSubjects();
		fetchCoverImageUrl();
		fetchSectionImageUrls();
	}, [coverImageId, sections]);

	const handleSectionChange = (index: number, field: string, value: string) => {
		const newSections = [...sections];
		newSections[index] = {
			...newSections[index],
			[field]: field === "order" ? Number(value) : value,
		};
		setSections(newSections);
	};

	const addSection = () => {
		setSections([
			...sections,
			{ order: sections.length, content: "", fileId: null },
		]);
		setSectionImageUrls([...sectionImageUrls, ""]);
	};

	const handleFileChange = async (
		e: React.ChangeEvent<HTMLInputElement>,
		setFileId: (fileId: string) => void,
		setImageUrl: (url: string) => void
	) => {
		const file = e.target.files && e.target.files[0];
		if (file) {
			try {
				// Request a presigned URL
				const presignedUrlResponse = await fetch(
					"http://167.172.165.109:8080/api/v1/presignedurls",
					{
						method: "POST",
						headers: {
							Authorization: `Bearer ${authToken}`,
							"Content-Type": "application/json",
						},
					}
				);
				const presignedUrlData = await presignedUrlResponse.json();
				const { presignedUrl, fileId } = presignedUrlData;

				// Upload the file to the presigned URL
				await fetch(presignedUrl, {
					method: "PUT",
					headers: {
						Authorization: `Bearer ${authToken}`,
						"Content-Type": "application/json",
					},
					body: file,
				});

				// Update the fileId and imageUrl state
				setFileId(fileId);

				const newImageUrl = presignedUrl.split("?")[0];
				setImageUrl(newImageUrl);
			} catch (error) {
				console.error("Error uploading file:", error);
				toast.error("Failed to upload file.");
			}
		}
	};

	const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		handleFileChange(e, setCoverImageId, setCoverImageUrl);
	};

	const handleSectionFileChange = (index: number) => (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		handleFileChange(
			e,
			(fileId: string) => {
				const newSections = [...sections];
				newSections[index].fileId = fileId;
				setSections(newSections);
			},
			(url: string) => {
				const newUrls = [...sectionImageUrls];
				newUrls[index] = url;
				setSectionImageUrls(newUrls);
			}
		);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const article: Article = {
			id: articleData.id,
			title,
			summary,
			coverImageId,
			sections,
			subjectId,
		};

		console.log("Submitting article:", JSON.stringify(article, null, 2));

		try {
			const response = await fetch(
				`http://167.172.165.109:8080/api/v1/admin/articles/${article.id}`,
				{
					method: "PUT",
					headers: {
						Authorization: `Bearer ${authToken}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify(article),
				}
			);

			const responseData = await response.json();
			console.log("Response data:", responseData);

			if (response.ok) {
				toast.success("Article updated successfully!");
				navigate("/articles");
			} else {
				console.error("Error updating article:", responseData);
				toast.error("Failed to update article.");
			}
		} catch (error) {
			console.error("An error occurred:", error);
			toast.error("An error occurred. Please try again.");
		}
	};

	const modules = {
		toolbar: [
			["bold", "italic", "underline"],
			[{ list: "ordered" }, { list: "bullet" }],
		],
	};

	const formats = ["bold", "italic", "underline", "list", "bullet"];

	return (
		<>
			<div className={`card ${className}`}>
				<div className="card-header border-0 pt-5">
					<h3 className="card-title align-items-start flex-column">
						<span className="card-label fw-bold fs-3 mb-1">Edit article</span>
					</h3>
				</div>
				<div className="card-body py-3">
					<div className="card">
						<form onSubmit={handleSubmit} className="p-4 row">
							<div className="mb-3 col-12 col-md-6">
								<label htmlFor="title" className="form-label">
									Title
								</label>
								<input
									type="text"
									className="form-control"
									id="title"
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									required
								/>
							</div>
							<div className="mb-3 col-12 col-md-6">
								<label htmlFor="summary" className="form-label">
									Summary
								</label>
								<input
									type="text"
									className="form-control"
									id="summary"
									value={summary}
									onChange={(e) => setSummary(e.target.value)}
									required
								/>
							</div>
							<div className="mb-3 col-12 col-md-6">
								<label htmlFor="subjectId" className="form-label">
									Subject
								</label>
								<select
									className="form-control"
									id="subjectId"
									value={subjectId}
									onChange={(e) => setSubjectId(e.target.value)}
									required
								>
									<option value="">Select a subject</option>
									{subjects.map((subject) => (
										<option key={subject.id} value={subject.id}>
											{subject.title}
										</option>
									))}
								</select>
							</div>
							<div className="mb-3 col-12 col-md-6">
								<label htmlFor="coverImageFile" className="form-label">
									Cover Image
								</label>
								<input
									type="file"
									className="form-control"
									id="coverImageFile"
									onChange={handleCoverImageChange}
								/>
							</div>
							<div className="mb-3 col-12 col-md-6">
								<img
									src={coverImageUrl}
									alt="Cover"
									className="mb-3"
									style={{
										width: "100%",
										maxHeight: "300px",
										objectFit: "contain",
									}}
								/>
							</div>

							<hr className="my-10"></hr>

							<div className="mb-4 mt-5">
								<h3 className="">Sections</h3>
								{sections.map((section, index) => (
									<div key={index} className="my-3 row">
										<div className="mb-4 col-12 col-md-6">
											<label
												htmlFor={`order-${index}`}
												className="fs-5 fw-semibold mb-2"
											>
												Order
											</label>
											<input
												type="number"
												className="form-control mb-1"
												id={`order-${index}`}
												placeholder="Order"
												value={section.order}
												onChange={(e) =>
													handleSectionChange(index, "order", e.target.value)
												}
												required
											/>
										</div>
										<div className="mb-4 col-12 col-md-6">
											<label
												htmlFor={`file-${index}`}
												className="fs-5 fw-semibold mb-2"
											>
												File
											</label>
											<input
												type="file"
												className="form-control mb-1"
												id={`file-${index}`}
												placeholder="File"
												onChange={handleSectionFileChange(index)}
											/>
										</div>
										<div className="mb-4 col-12">
											<img
												src={sectionImageUrls[index]}
												alt={`Section ${index} Image`}
												className="mb-3"
												style={{
													width: "100%",
													maxHeight: "300px",
													objectFit: "contain",
												}}
											/>
										</div>
										<div className="mb-4 col-12">
											<label
												htmlFor={`content-${index}`}
												className="fs-5 fw-semibold mb-2"
											>
												Content
											</label>
											<ReactQuill
												value={section.content}
												onChange={(value: string) =>
													handleSectionChange(index, "content", value)
												}
												modules={modules}
												formats={formats}
												className="mb-1"
												theme="snow"
											/>
										</div>
									</div>
								))}
								<button
									type="button"
									className="btn btn-secondary"
									onClick={addSection}
								>
									Add Section
								</button>
							</div>

							<button type="submit" className="btn btn-primary">
								Update
							</button>
						</form>
						<ToastContainer />
					</div>
				</div>
			</div>
		</>
	);
};

export { EditArticlesForm };
