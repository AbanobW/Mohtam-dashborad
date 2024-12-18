/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactQuill from "react-quill";
import Select from "react-select";
import "react-quill/dist/quill.snow.css";
import { useAuth } from "../auth";

type Props = {
	className: string;
};

type Section = {
	order: number;
	content: string;
	fileUrl: string | null;
	fileType: "IMAGE" | "VIDEO"; // Updated to handle both types
};

type Article = {
	id: string;
	title: string;
	summary: string;
	coverImageUrl: string;
	sections: Section[];
	subjectId: string;
	tags: string[];
	published: boolean;
};

type Subject = {
	id: string;
	title: string;
};

type Tag = {
	id: string;
	name: string;
};

type LocationState = {
	item: Article;
};

const EditArticlesForm: React.FC<Props> = ({ className }) => {
	const { auth } = useAuth();
	const authToken = auth?.accessToken;
	const location = useLocation() as { state: LocationState };
	const navigate = useNavigate();
	const articleData = location.state.item;
	const [disabled, setDisabled] = useState(false)

	const [title, setTitle] = useState<string>(articleData?.title || "");
	const [summary, setSummary] = useState<string>(
		articleData?.summary || "summary"
	);
	const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
	const [coverImageUrl, setCoverImageUrl] = useState<string>(
		articleData?.coverImageUrl || ""
	);
	const [subjectId, setSubjectId] = useState<string>(
		articleData?.subjectId || ""
	);
	const [published, setPublished] = useState<boolean>(
		articleData?.published || false
	);
	const [sections, setSections] = useState<Section[]>(
		articleData?.sections || [
			{ order: 0, content: "", fileUrl: null, fileType: "IMAGE" },
		]
	);
	const [subjects, setSubjects] = useState<Subject[]>([]);
	const [tags, setTags] = useState<string[]>(articleData?.tags || []);
	const [tagOptions, setTagOptions] = useState<Tag[]>([]);
	const [loading, setLoading] = useState<boolean>(false);

	const apiUrl = import.meta.env.VITE_APP_API_URL;
	const imgUrl = import.meta.env.VITE_APP_Img_URL;

	const [sectionLoading, setSectionLoading] = useState<boolean[]>(
		sections.map(() => false)
	);

	useEffect(() => {
		const fetchSubjects = async () => {
			try {
				const response = await fetch(`${apiUrl}/subjects`, {
					headers: {
						Authorization: `Bearer ${authToken}`,
						"Content-Type": "application/json",
					},
				});
				const data = await response.json();
				setSubjects(data.items || []);
			} catch (error) {
				console.error("Error fetching subjects:", error);
				toast.error("Failed to fetch subjects.");
			}
		};

		const fetchTags = async () => {
			try {
				const response = await fetch(`${apiUrl}/tags?page=0&size=99999`, {
					headers: {
						Authorization: `Bearer ${authToken}`,
						"Content-Type": "application/json",
					},
				});
				const data = await response.json();
				setTagOptions(data.items || []);
			} catch (error) {
				console.error("Error fetching tags:", error);
				toast.error("Failed to fetch tags.");
			}
		};

		fetchSubjects();
		fetchTags();
	}, [authToken]);

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
			{ order: sections.length, content: "", fileUrl: null, fileType: "IMAGE" },
		]);
	};

	const handleFileChange = async (
		e: React.ChangeEvent<HTMLInputElement>,
		setFileId: (fileId: string) => void,
		index?: number
	) => {
		const file = e.target.files && e.target.files[0];
		if (file) {
			setDisabled(true);
			try {
				if (typeof index === "number") {
					setSectionLoading((prev) => {
						const newLoading = [...prev];
						newLoading[index] = true;
						return newLoading;
					});
				} else {
					setLoading(true);
				}

				const presignedUrlResponse = await fetch(`${apiUrl}/presignedurls`, {
					method: "POST",
					headers: {
						Authorization: `Bearer ${authToken}`,
						"Content-Type": "application/json",
					},
				});
				const presignedUrlData = await presignedUrlResponse.json();
				const { presignedUrl, fileId } = presignedUrlData;

				await fetch(presignedUrl, {
					method: "PUT",
					body: file,
				});

				// Determine file type
				const fileType = file.type.startsWith("image/") ? "IMAGE" : "VIDEO";

				// Set file ID and type in the section
				setFileId(fileId);

				if (typeof index === "number") {
					const newSections = [...sections];
					newSections[index].fileUrl = `${imgUrl}${fileId}`;
					newSections[index].fileType = fileType;
					setSections(newSections);
				}
			} catch (error) {
				console.error("Error uploading file:", error);
				toast.error("Failed to upload file.");
			} finally {
				setDisabled(false);
				if (typeof index === "number") {
					setSectionLoading((prev) => {
						const newLoading = [...prev];
						newLoading[index] = false;
						return newLoading;
					});
				} else {
					setLoading(false);
				}
			}
		}
	};

	const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		handleFileChange(e, (fileId: string) => {
			setCoverImageUrl(`${imgUrl}${fileId}`);
		});
	};

	const handleSectionFileChange =
		(index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
			handleFileChange(
				e,
				(fileId: string) => {
					const newSections = [...sections];
					newSections[index].fileUrl = `${imgUrl}${fileId}`;
					setSections(newSections);
				},
				index
			);
		};

	const handleTagChange = (selectedOptions: any) => {
		const selectedTagIds = selectedOptions.map((option: any) => option.value);
		setTags(selectedTagIds);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const article: Article = {
			id: articleData.id,
			title,
			summary,
			coverImageUrl,
			sections,
			subjectId,
			tags,
			published,
		};

		try {
			const response = await fetch(`${apiUrl}/articles/${article.id}`, {
				method: "PUT",
				headers: {
					Authorization: `Bearer ${authToken}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(article),
			});

			const responseData = await response.json();

			if (response.ok) {
				toast.success("CampFires updated successfully!");
			} else {
				console.error("Error updating CampFires:", responseData);
				toast.error("Failed to update CampFires.");
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

	const handleDeleteSection = (index: number) => {
		const newSections = sections.filter((_, i) => i !== index);
		setSections(newSections);
	};

	return (
		<>
			<div className={`card ${className}`}>
				<div className="card-header border-0 pt-5">
					<h3 className="card-title align-items-start flex-column">
						<span className="card-label fw-bold fs-3 mb-1">Edit Camp Fire</span>
					</h3>
				</div>
				<div className="card-body py-3">
					<form onSubmit={handleSubmit} className="p-4 row">
						<div className="mb-4 col-12 col-md-6">
							<label htmlFor="title" className="fs-5 fw-semibold mb-2">
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
						{/* <div className="mb-4 col-12 col-md-6">
							<label htmlFor="summary" className="fs-5 fw-semibold mb-2">
								Summary
							</label>
							<input
								className="form-control"
								id="summary"
								value={summary}
								onChange={(e) => setSummary(e.target.value)}
								required
							/>
						</div> */}

						<div className="mb-4 col-12 col-md-6">
							<label htmlFor="subjectId" className="fs-5 fw-semibold mb-2">
								Tent
							</label>
							<select
								className="form-control"
								id="subjectId"
								value={subjectId}
								onChange={(e) => setSubjectId(e.target.value)}
								required
							>
								<option value="">Select a tent</option>
								{Array.isArray(subjects) &&
									subjects.map((subject) => (
										<option key={subject.id} value={subject.id}>
											{subject.title}
										</option>
									))}
							</select>
						</div>
						<div className="mb-4 col-12 col-md-6">
							<label className="fs-5 fw-semibold mb-2">Tags</label>
							<Select
								isMulti
								options={tagOptions.map((tag) => ({
									value: tag.id,
									label: tag.name,
								}))}
								value={tagOptions
									.filter((tag) => tags.includes(tag.id))
									.map((tag) => ({
										value: tag.id,
										label: tag.name,
									}))}
								onChange={handleTagChange}
							/>
						</div>
						<div className="mb-4 col-12 col-md-6">
							<label className="fs-5 fw-semibold mb-2">Published</label>
							<div className="form-check form-switch">
								<input
									className="form-check-input"
									type="checkbox"
									id="published"
									checked={published}
									onChange={(e) => setPublished(e.target.checked)}
								/>
								<label className="form-check-label" htmlFor="published">
									{published ? "Published" : "Unpublished"}
								</label>
							</div>
						</div>
						<div className="mb-4 col-12 col-md-6">
							<label htmlFor="coverImage" className="fs-5 fw-semibold mb-2">
								Cover Image
							</label>
							<input
								type="file"
								className="form-control"
								id="coverImage"
								onChange={handleCoverImageChange}
								disabled={loading}
							/>
							{loading && <div className="loader mt-2"></div>}
							{coverImageUrl && (
								<img
									src={coverImageUrl}
									alt="Cover"
									className="img-fluid mt-2"
								/>
							)}
						</div>

						<div className="col-12 mb-3">
							<label className="fs-5 fw-semibold mb-2">Sections</label>
							{sections.map((section, index) => (
								<div key={index} className="border rounded p-4 mb-4">
									<div className="mb-3">
										<label className="form-label">Content</label>
										<ReactQuill
											value={section.content}
											onChange={(value) =>
												handleSectionChange(index, "content", value)
											}
											modules={modules}
											formats={formats}
										/>
									</div>
									<div className="mb-3">
										<label className="form-label">File</label>
										<input
											type="file"
											className="form-control"
											onChange={handleSectionFileChange(index)}
											disabled={sectionLoading[index]}
										/>
										{sectionLoading[index] && (
											<div className="loader mt-2"></div>
										)}
										{section.fileUrl && (
											<>
												{section.fileType === "IMAGE" ? (
													<img
														src={section.fileUrl}
														alt="Section"
														className="img-fluid mt-2"
													/>
												) : (
													<video controls className="img-fluid mt-2">
														<source src={section.fileUrl} type="video/mp4" />
														Your browser does not support the video tag.
													</video>
												)}
											</>
										)}
									</div>
									<button
										type="button"
										className="btn btn-danger mt-2"
										onClick={() => handleDeleteSection(index)}
									>
										Delete Section
									</button>
								</div>
							))}
							<button
								type="button"
								className="btn btn-secondary"
								onClick={addSection}
								disabled={loading}
							>
								Add Section
							</button>
						</div>

						<div className="col-12">
							<button
								type="submit"
								className="btn btn-primary"
								disabled={disabled}
							>
								Save Camp Fire
							</button>
						</div>
					</form>
				</div>
			</div>
			<ToastContainer />
		</>
	);
};

export { EditArticlesForm };
