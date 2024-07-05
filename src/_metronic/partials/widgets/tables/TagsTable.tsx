import React, { useEffect, useState } from "react";
import { KTIcon } from "../../../helpers";
import { Add } from "../../../../app/modules/tags/Add";
import { Edit } from "../../../../app/modules/tags/Edit";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import { useAuth } from "../../../../app/modules/auth";

type Props = {
	className: string;
};

type Item = {
	[x: string]: string;
	id: string;
	title: string;
	description: string;
	coverImageUrl: string;
	// articles: string[];
};

const TagsTable: React.FC<Props> = ({ className }) => {
	const [items, setItems] = useState<Item[]>([]);
	const [page, setPage] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	const [selectedTagId, setSelectedTagId] = useState<string | null>(
		null
	);

	const { auth } = useAuth();
	const authToken = auth?.accessToken;
	const apiUrl = import.meta.env.VITE_APP_API_URL;


	const fetchSubjects = async (page: number = 0) => {
		try {
			const response = await fetch(
				`${apiUrl}/tags?page=${page}`,
				{
					headers: {
						Authorization: `Bearer ${authToken}`,
						"Content-Type": "application/json",
					},
				}
			);
			const data = await response.json();

			setItems(data.items);
			setPage(data.page);
			setTotalPages(data.totalPages);
		} catch (error) {
			console.error("Error fetching data:", error);
		}
	};

	useEffect(() => {
		fetchSubjects();
	}, []);

	const handleDelete = (id: string) => {
		Swal.fire({
			title: "Are you sure?",
			text: "You will not be able to recover this tag!",
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: "Yes, delete it!",
			cancelButtonText: "Cancel",
		}).then((result) => {
			if (result.isConfirmed) {
				fetch(`${apiUrl}/tags/${id}`, {
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${authToken}`,
						"Content-Type": "application/json",
					},
				})
					.then((response) => {
						if (response.ok) {
							setItems(items.filter((item) => item.id !== id));
							toast.success("Tag deleted successfully");
						} else {
							console.error("Error deleting item:", response.statusText);
							toast.error("Failed to delete tag");
						}
					})
					.catch((error) => {
						console.error("Error deleting item:", error);
						toast.error("Failed to delete tag");
					});
			}
		});
	};

	const handlePageChange = (newPage: number) => {
		if (newPage >= 0 && newPage < totalPages) {
			fetchSubjects(newPage);
		}
	};

	return (
		<div className={`card ${className}`}>
			<div className="card-header border-0 pt-5">
				<h3 className="card-title align-items-start flex-column">
					<span className="card-label fw-bold fs-3 mb-1">Tags</span>
				</h3>
				<div className="card-toolbar">
					<a
						className="btn btn-sm btn-light-primary"
						data-bs-toggle="modal"
						data-bs-target="#kt_modal_add_Sub"
					>
						<KTIcon iconName="plus" className="fs-2" />
						Add New Tag
					</a>

					<Add onAddSuccess={() => fetchSubjects(page)} />
				</div>
			</div>
			<div className="card-body py-3">
				<div className="table-responsive">
					<table className="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4">
						<thead>
							<tr className="fw-bold text-muted bg-light border-none border-bottom">
								<th className="ps-4 min-w-50px rounded-start">#</th>
								<th className="min-w-200px">Title</th>
								{/* <th className="min-w-300px">Description</th>
								<th className="min-w-100px">Image</th> */}
								<th className="min-w-150px text-end">Actions</th>
							</tr>
						</thead>
						<tbody>
							{items.map((item, index) => (
								<tr key={item.id}>
									<td>
										<div className="d-flex align-items-center">
											<div className="d-flex justify-content-start flex-column">
												<span className="text-gray-900 fw-bold text-hover-primary mb-1 fs-6">
													{page * 10 + index + 1}
												</span>
											</div>
										</div>
									</td>
									<td>
										<div className="d-flex align-items-center">
											<div className="d-flex justify-content-start flex-column">
												<a className="text-gray-900 fw-bold text-hover-primary mb-1 fs-6">
													{item.name}
												</a>
											</div>
										</div>
									</td>
									{/* <td>
										<span className="text-gray-900 fw-bold d-block mb-1 fs-6">
											{item.description}
										</span>
									</td>
									<td>
										<a
											href={item.coverImageUrl}
											className="btn-light-primary fw-bold d-block mb-1 fs-6"
											target="blank"
										>
											Preview
										</a>
									</td> */}
									<td className="text-end">
										<a
											className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1"
											data-bs-toggle="modal"
											data-bs-target="#kt_modal_edit_Sub"
											onClick={() => setSelectedTagId(item.id)}
										>
											<KTIcon iconName="pencil" className="fs-3" />
										</a>
										<a
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
					<Edit
						tagId={selectedTagId}
						onEditSuccess={() => fetchSubjects(page)}
					/>
				</div>
				<div className="d-flex justify-content-start align-items-center mt-4">
					<button
						className="btn btn-light-primary"
						disabled={page === 0}
						onClick={() => handlePageChange(page - 1)}
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
								onClick={() => handlePageChange(index)}
							>
								{index + 1}
							</button>
						))}
					</div>
					<button
						className="btn btn-light-primary"
						disabled={page === totalPages - 1}
						onClick={() => handlePageChange(page + 1)}
					>
						Next
					</button>
				</div>
			</div>
			<ToastContainer />
		</div>
	);
};

export { TagsTable };
