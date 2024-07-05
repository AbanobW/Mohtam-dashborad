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
	fileId: string | null;
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

	const [title, setTitle] = useState<string>("");
	const [summary, setSummary] = useState<string>("");
	const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
	const [coverImageUrl, setcoverImageUrl] = useState<string>("");
	const [subjectId, setSubjectId] = useState<string>("");
	// const [tagIds, setTagIds] = useState<string[]>([]);
	const [published, setPublished] = useState<boolean>(true);
	const [sections, setSections] = useState<Section[]>([
		{ order: 0, content: "", fileId: null },
	]);
	const [subjects, setSubjects] = useState<Subject[]>([]);
	const [tags, setTags] = useState<Tag[]>([]);
	const [tagOptions, setTagOptions] = useState<Tag[]>([]);


	const apiUrl = import.meta.env.VITE_APP_API_URL;

	useEffect(() => {
		const fetchSubjects = async () => {
			try {
				const response = await fetch(
					`${apiUrl}/subjects`,
					{
						headers: {
							Authorization: `Bearer ${authToken}`,
							"Content-Type": "application/json",
						},
					}
				);
				const data = await response.json();
				console.log("Fetched subjects:", data);
				setSubjects(data.items || []);
			} catch (error) {
				console.error("Error fetching subjects:", error);
				toast.error("Failed to fetch subjects.");
			}
		};

		const fetchTags = async () => {
			try {
				const response = await fetch(
					`${apiUrl}/tags`,
					{
						headers: {
							Authorization: `Bearer ${authToken}`,
							"Content-Type": "application/json",
						},
					}
				);
				const data = await response.json();
				console.log("Fetched tags:", data);
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
			{ order: sections.length, content: "", fileUrl: null },
		]);
	};

	const handleFileChange = async (
		e: React.ChangeEvent<HTMLInputElement>,
		setFileId: (fileUrl: string) => void
	) => {
		const file = e.target.files && e.target.files[0];
		if (file) {
			try {
				// Request a presigned URL
				const presignedUrlResponse = await fetch(
					`${apiUrl}/presignedurls`,
					{
						method: "POST",
						headers: {
							Authorization: `Bearer ${authToken}`,
							"Content-Type": "application/json",
						},
					}
				);
				const presignedUrlData = await presignedUrlResponse.json();
				const { presignedUrl, fileUrl } = presignedUrlData;

				// Upload the file to the presigned URL
				await fetch(presignedUrl, {
					method: "PUT",
					body: file,
				});

				// Update the fileId state
				setFileId(fileUrl);
			} catch (error) {
				console.error("Error uploading file:", error);
				toast.error("Failed to upload file.");
			}
		}
	};

	const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		handleFileChange(e, setcoverImageUrl);
	};

	const handleSectionFileChange = (index: number) => (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		handleFileChange(e, (fileUrl: string) => {
			const newSections = [...sections];
			newSections[index].fileUrl = fileUrl;
			setSections(newSections);
		});
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
			const response = await fetch(
				`${apiUrl}/articles`,
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${authToken}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify(article),
				}
			);

			const responseData = await response.json();

			if (response.ok) {
				toast.success("Article added successfully!");
				setTitle("");
				setSummary("");
				setCoverImageFile(null);
				setcoverImageUrl("");
				setSubjectId("");
				setTags([]);
				setPublished(false);
				setSections([{ order: 0, content: "", fileUrl: null }]);
			} else {
				console.error("Error adding article:", responseData);
				toast.error("Failed to add article.");
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
					<span className="card-label fw-bold fs-3 mb-1">Add new article</span>
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
					<div className="mb-4 col-12 col-md-6">
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
					</div>

					<div className="mb-4 col-12 col-md-6">
						<label htmlFor="subjectId" className="fs-5 fw-semibold mb-2">
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
							{Array.isArray(subjects) &&
								subjects.map((subject) => (
									<option key={subject.id} value={subject.id}>
										{subject.title}
									</option>
								))}
						</select>
					</div>

					<div className="mb-4 col-12 col-md-6">
						<label htmlFor="coverImageFile" className="fs-5 fw-semibold mb-2">
							Cover Image
						</label>
						<input
							type="file"
							className="form-control"
							id="coverImageFile"
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
							options={tagOptions.map((tag) => ({ value: tag.id, label: tag.name }))}
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
									htmlFor={`fileId-${index}`}
									className="fs-5 fw-semibold mb-2"
								>
									File
								</label>
								<input
									type="file"
									className="form-control mb-1"
									id={`fileId-${index}`}
									placeholder="File"
									onChange={handleSectionFileChange(index)}
									required
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
									id={`content-${index}`}
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
					Submit
				</button>
			</form>
		</div>
		<ToastContainer />
	</div>
);

};
export { AddArticlesForm };
