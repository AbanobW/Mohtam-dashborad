/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import ReactQuill from "react-quill";
import Select from "react-select";
import "react-quill/dist/quill.snow.css";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../auth";

type Props = {
	className: string;
};

type Section = {
	order: number;
	content: string;
	fileUrl: string | null;
	fileType: "IMAGE" | "VIDEO";
};

type Article = {
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

const AddArticlesForm: React.FC<Props> = ({ className }) => {
	const { auth } = useAuth();
	const authToken = auth?.accessToken;
	const [disabled, setDisabled] = useState(true)


	const [title, setTitle] = useState<string>("");
	const [summary, setSummary] = useState<string>("summary test");
	const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
	const [coverImageUrl, setCoverImageUrl] = useState<string>("");
	const [subjectId, setSubjectId] = useState<string>("");
	const [published, setPublished] = useState<boolean>(true);
	const [sections, setSections] = useState<Section[]>([
		{ order: 0, content: "", fileUrl: null, fileType: "IMAGE" },
	]);
	const [subjects, setSubjects] = useState<Subject[]>([]);
	const [tags, setTags] = useState<string[]>([]);
	const [tagOptions, setTagOptions] = useState<Tag[]>([]);
	const [loading, setLoading] = useState<{ [key: string]: boolean }>({});

	const apiUrl = import.meta.env.VITE_APP_API_URL;
	const imgUrl = import.meta.env.VITE_APP_Img_URL;

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
	}, []);

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
		setFileId: (fileId: string, fileType: "IMAGE" | "VIDEO") => void,
		loaderKey: string
	) => {
		const file = e.target.files && e.target.files[0];
		if (file) {
			setLoading((prev) => ({ ...prev, [loaderKey]: true }));
			setDisabled(true);

			try {
				// Request a presigned URL
				const presignedUrlResponse = await fetch(`${apiUrl}/presignedurls`, {
					method: "POST",
					headers: {
						Authorization: `Bearer ${authToken}`,
						"Content-Type": "application/json",
					},
				});
				const presignedUrlData = await presignedUrlResponse.json();
				const { presignedUrl, fileId } = presignedUrlData;

				// Upload the file to the presigned URL
				await fetch(presignedUrl, {
					method: "PUT",
					body: file,
				});

				const fileType = file.type.startsWith("video/") ? "VIDEO" : "IMAGE";
				setFileId(fileId, fileType);
			} catch (error) {
				console.error("Error uploading file:", error);
				toast.error("Failed to upload file.");
			} finally {
				setLoading((prev) => ({ ...prev, [loaderKey]: false }));
				setDisabled(false);
			}
		}
	};

	const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		handleFileChange(
			e,
			(fileId: string) => {
				setCoverImageUrl(`${imgUrl}${fileId}`);
			},
			"coverImage"
		);
	};

	const handleSectionFileChange =
		(index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
			handleFileChange(
				e,
				(fileId: string, fileType: "IMAGE" | "VIDEO") => {
					const newSections = [...sections];
					newSections[index].fileUrl = `${imgUrl}${fileId}`;
					newSections[index].fileType = fileType;
					setSections(newSections);
				},
				`section-${index}`
			);
		};

	const handleTagChange = (selectedOptions: any) => {
		const selectedTagIds = selectedOptions.map((option: any) => option.label);
		setTags(selectedTagIds);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const article: Article = {
			title,
			summary,
			coverImageUrl,
			sections,
			subjectId,
			tags,
			published,
		};

		console.log("Submitting article:", JSON.stringify(article, null, 2));

		try {
			const response = await fetch(`${apiUrl}/articles`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${authToken}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(article),
			});

			const responseData = await response.json();

			if (response.ok) {
				toast.success("Camp Fires added successfully!");
				setTitle("");
				setSummary("Camp Fires Summary");
				setCoverImageFile(null);
				setCoverImageUrl("");
				setSubjectId("");
				setTags([]);
				setPublished(false);
				setSections([
					{ order: 0, content: "", fileUrl: null, fileType: "IMAGE" },
				]);
			} else {
				console.error("Error adding Camp Fire:", responseData);
				toast.error("Failed to add Camp Fire.");
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
		<div className={`card ${className}`}>
			<div className="card-header border-0 pt-5">
				<h3 className="card-title align-items-start flex-column">
					<span className="card-label fw-bold fs-3 mb-1">Add new camp fire</span>
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
							Tents
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
						<label className="fs-5 fw-semibold mb-2">
							Cover media{" "}
							{loading.coverImage && <div className="loader mt-2"></div>}
						</label>
						<input
							type="file"
							className="form-control"
							onChange={handleCoverImageChange}
						/>
					</div>

					<div className="mb-4 col-12 col-md-6">
						<label htmlFor="tags" className="fs-5 fw-semibold mb-2">
							Tags
						</label>
						<Select
							isMulti
							name="tags"
							options={tagOptions.map((tag) => ({
								value: tag.id,
								label: tag.name,
							}))}
							className="basic-multi-select"
							classNamePrefix="select"
							onChange={handleTagChange}
						/>
					</div>

					<div className="col-md-6 mt-5">
						<label className="fs-5 fw-semibold mb-2">Is Publish</label>
						<div className="form-check form-check-solid form-switch fv-row">
							<input
								className="form-check-input w-45px h-30px"
								type="checkbox"
								id="published"
								name="published"
								checked={published}
								onChange={(e) => setPublished(e.target.checked)}
							/>
							<label className="form-check-label" htmlFor="published"></label>
						</div>
					</div>

					<hr className="my-10"></hr>

					<div className="col-12">
						<h4 className="mb-3">Sections</h4>
						{sections.map((section, index) => (
							<div key={index} className="border rounded p-4 mb-4">
								<label className="fs-5 fw-semibold mb-2">Order</label>
								<input
									type="number"
									className="form-control mb-2"
									value={section.order}
									onChange={(e) =>
										handleSectionChange(index, "order", e.target.value)
									}
									required
								/>
								<label className="fs-5 fw-semibold mb-2">Content</label>
								<ReactQuill
									value={section.content}
									onChange={(content) =>
										handleSectionChange(index, "content", content)
									}
									modules={modules}
									formats={formats}
								/>
								<label className="fs-5 fw-semibold mb-2 mt-2">
									Media
									{loading[`section-${index}`] && (
										<div className="loader mt-2"></div>
									)}
								</label>
								<input
									type="file"
									className="form-control"
									onChange={handleSectionFileChange(index)}
									title="Upload media file"
								/>
							</div>
						))}
						<button
							type="button"
							className="btn btn-primary mb-4"
							onClick={addSection}
						>
							Add Section
						</button>
					</div>
					<div className="col-12 text-end">
						<button type="submit" className="btn btn-primary" disabled={disabled}>
							Add Camp Fires
						</button>
					</div>
				</form>
			</div>
			<ToastContainer />
		</div>
	);
};

export { AddArticlesForm };
