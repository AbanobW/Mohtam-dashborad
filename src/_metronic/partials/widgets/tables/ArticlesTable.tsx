/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { KTIcon } from "../../../helpers";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import { useAuth } from "../../../../app/modules/auth";

type Props = {
	className: string;
};

type Item = {
	id: string;
	title: string;
	summary: string;
	coverImageId: string;
	coverImageUrl: string;
	subjectId: string;
	published: boolean;
};

type Subject = {
	id: string;
	title: string;
};

const ArticlesTable: React.FC<Props> = ({ className }) => {
	const { auth } = useAuth();
	const authToken = auth?.accessToken;
	const [items, setItems] = useState<Item[]>([]);
	const [subjects, setSubjects] = useState<Subject[]>([]);
	const [page, setPage] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
		null
	);

	const navigate = useNavigate();

	const fetchPresignedUrl = async (id: string): Promise<string> => {
		const response = await fetch(
			`http://167.172.165.109:8080/api/v1/presignedurls/${id}`,
			{
				headers: {
					Authorization: `Bearer ${authToken}`,
					"Content-Type": "application/json",
				},
			}
		);
		const data = await response.json();
		return data.presignedUrl;
	};

	const fetchArticles = async (page: number = 0) => {
		try {
			const response = await fetch(
				`http://167.172.165.109:8080/api/v1/admin/articles?page=${page}`,
				{
					headers: {
						Authorization: `Bearer ${authToken}`,
						"Content-Type": "application/json",
					},
				}
			);
			const data = await response.json();
			const itemsWithUrls = await Promise.all(
				data.items.map(async (item: any) => {
					const presignedUrl = await fetchPresignedUrl(item.coverImageId);
					return { ...item, coverImageUrl: presignedUrl };
				})
			);
			setItems(itemsWithUrls);
			setPage(data.page);
			setTotalPages(data.totalPages);
		} catch (error) {
			console.error("Error fetching data:", error);
		}
	};

	const fetchSubjects = () => {
		fetch(`http://167.172.165.109:8080/api/v1/admin/subjects`, {
			headers: {
				Authorization: `Bearer ${authToken}`,
				"Content-Type": "application/json",
			},
		})
			.then((response) => response.json())
			.then((data) => {
				setSubjects(data.items);
			})
			.catch((error) => console.error("Error fetching subjects:", error));
	};

	useEffect(() => {
		fetchArticles();
		fetchSubjects();
	}, []);

	const handleDelete = (id: string) => {
		Swal.fire({
			title: "Are you sure?",
			text: "You will not be able to recover this article!",
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: "Yes, delete it!",
			cancelButtonText: "Cancel",
		}).then((result) => {
			if (result.isConfirmed) {
				fetch(`http://167.172.165.109:8080/api/v1/admin/articles/${id}`, {
					method: "DELETE",

					headers: {
						Authorization: `Bearer ${authToken}`,
						"Content-Type": "application/json",
					},
				})
					.then((response) => {
						if (response.ok) {
							setItems(items.filter((item) => item.id !== id));
							toast.success("Article deleted successfully");
						} else {
							console.error("Error deleting item:", response.statusText);
							toast.error("Failed to delete article");
						}
					})
					.catch((error) => {
						console.error("Error deleting item:", error);
						toast.error("Failed to delete article");
					});
			}
		});
	};

	const handleTogglePublished = (id: string, currentStatus: boolean) => {
		const newStatus = !currentStatus;
		Swal.fire({
			title: "Are you sure?",
			text: `Do you want to ${
				newStatus ? "publish" : "unpublish"
			} this article?`,
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: "Yes",
			cancelButtonText: "Cancel",
		}).then((result) => {
			if (result.isConfirmed) {
				fetch(`http://167.172.165.109:8080/api/v1/admin/articles/${id}`, {
					method: "PUT",
					headers: {
						Authorization: `Bearer ${authToken}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						published: newStatus,
					}),
				})
					.then((response) => {
						if (response.ok) {
							setItems((prevItems) =>
								prevItems.map((item) =>
									item.id === id ? { ...item, published: newStatus } : item
								)
							);
							toast.success("Article status updated successfully");
						} else {
							console.error("Error updating item:", response.statusText);
							toast.error("Failed to update article status");
						}
					})
					.catch((error) => {
						console.error("Error updating item:", error);
						toast.error("Failed to update article status");
					});
			}
		});
	};

	const handleEdit = (item: Item) => {
		navigate("/editArticle", { state: { item } });
	};

	const getSubjectTitle = (subjectId: string) => {
		const subject = subjects.find((subject) => subject.id === subjectId);
		return subject ? subject.title : "Unknown Subject";
	};

	return (
		<div className={`card ${className}`}>
			<div className="card-header border-0 pt-5">
				<h3 className="card-title align-items-start flex-column">
					<span className="card-label fw-bold fs-3 mb-1">Articles</span>
				</h3>
				<div className="card-toolbar">
					<a className="btn btn-sm btn-light-primary" href="/addArticle">
						<KTIcon iconName="plus" className="fs-2" />
						Add New Article
					</a>
				</div>
			</div>
			<div className="card-body py-3">
				<div className="table-responsive">
					<table className="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4">
						<thead>
							<tr className="fw-bold text-muted bg-light  border-bottom">
								<th className="ps-4 min-w-50px rounded-start">#</th>
								<th className="min-w-250px">Title</th>
								<th className="min-w-300px">Summary</th>
								<th className="min-w-200px">Subject</th>
								<th className="min-w-50px">Cover Image</th>
								<th className="min-w-50px">Published</th>
								<th className="min-w-150px text-end">Actions</th>
							</tr>
						</thead>
						<tbody>
							{items.map((item, index) => (
								<tr key={item.id}>
									{/* Id */}
									<td>
										<div className="d-flex align-items-center">
											<div className="d-flex justify-content-start flex-column">
												<span className="text-gray-900 fw-bold text-hover-primary mb-1 fs-6">
													{page * 10 + index + 1}
												</span>
											</div>
										</div>
									</td>
									{/* Title */}
									<td>
										<div className="d-flex align-items-center">
											<div className="d-flex justify-content-start flex-column">
												<a
													href="#"
													className="text-gray-900 fw-bold text-hover-primary mb-1 fs-6"
												>
													{item.title}
												</a>
											</div>
										</div>
									</td>
									{/* Summary */}
									<td>
										<span className="text-gray-900 fw-bold d-block mb-1 fs-6">
											{item.summary}
										</span>
									</td>
									{/* Subject */}
									<td>
										<span className="text-gray-900 fw-bold d-block mb-1 fs-6">
											{getSubjectTitle(item.subjectId)}
										</span>
									</td>
									{/* Cover Image */}
									<td>
										<a
											href={item.coverImageUrl}
											className="btn-light-primary fw-bold d-block mb-1 fs-6"
											target="_blank"
											rel="noopener noreferrer"
										>
											Preview
										</a>
									</td>
									{/* Published */}
									<td>
										{item.published ? (
											<span className="badge badge-light-success fs-6">Published</span>
										) : (
											<span className="badge badge-light-danger fs-6">Unpublished</span>
										)}
									</td>
									<td className="text-end">
										<a
											href="#"
											className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1"
											onClick={() =>
												handleTogglePublished(item.id, item.published)
											}
										>
											<KTIcon iconName="switch" className="fs-3" />
										</a>
										<a
											className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1"
											onClick={() => handleEdit(item)}
										>
											<KTIcon iconName="pencil" className="fs-3" />
										</a>
										<a
											href="#"
											className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm"
											onClick={() => handleDelete(item.id)}
										>
											<KTIcon iconName="trash" className="fs-3" />
										</a>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<div className="d-flex justify-content-start align-items-center mt-4">
					<button
						className="btn btn-light-primary"
						disabled={page === 0}
						onClick={() => fetchArticles(page - 1)}
					>
						Previous
					</button>
					<div className="mx-5">
						{Array.from({ length: totalPages }, (_, index) => (
							<button
								key={index}
								className={`btn btn-light-primary mx-1 ${
									index === page ? "active" : ""
								}`}
								onClick={() => fetchArticles(index)}
							>
								{index + 1}
							</button>
						))}
					</div>
					<button
						className="btn btn-light-primary"
						disabled={page === totalPages - 1}
						onClick={() => fetchArticles(page + 1)}
					>
						Next
					</button>
				</div>
			</div>
			<ToastContainer />
		</div>
	);
};
export { ArticlesTable };
