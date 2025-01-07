/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { KTIcon } from "../../../helpers";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import { useAuth } from "../../../../app/modules/auth";
import { Edit } from "../../../../app/modules/users/Edit";
import { AddAdmin } from "../../../../app/modules/users/Add";

type Props = {
	className: string;
};

type Item = {
	id: string;
	userName: string;
	email: string;
	role: string;
	active: boolean;
	createdAt: string;
};

const UsersTable: React.FC<Props> = () => {
	const { auth } = useAuth();
	const authToken = auth?.accessToken;
	const [items, setItems] = useState<Item[]>([]);
	const [page, setPage] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	const [searchQuery, setSearchQuery] = useState<string>("");

	const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
	const apiUrl = import.meta.env.VITE_APP_API_URL;

	const fetchUsers = async (page: number = 0) => {
		try {
			const response = await fetch(
				`${apiUrl}/users?page=${page}`,
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
		fetchUsers();
	}, []);

	const handleDelete = (id: string) => {
		Swal.fire({
			title: "Are you sure?",
			text: "You will not be able to recover this user!",
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: "Yes, delete it!",
			cancelButtonText: "Cancel",
		}).then((result) => {
			if (result.isConfirmed) {
				fetch(`${apiUrl}/users/${id}`, {
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${authToken}`,
						"Content-Type": "application/json",
					},
				})
					.then((response) => {
						if (response.ok) {
							setItems(items.filter((item) => item.id !== id));
							toast.success("User deleted successfully");
						} else {
							console.error("Error deleting item:", response.statusText);
							toast.error("Failed to delete user");
						}
					})
					.catch((error) => {
						console.error("Error deleting item:", error);
						toast.error("Failed to delete user");
					});
			}
		});
	};

	const handleToggleActive = (id: string, currentStatus: boolean) => {
		const newStatus = !currentStatus;
		Swal.fire({
			title: "Are you sure?",
			text: `Do you want to ${newStatus ? "active" : "unactive"} this user?`,
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: "Yes",
			cancelButtonText: "Cancel",
		}).then((result) => {
			if (result.isConfirmed) {
				fetch(`${apiUrl}/users/${id}`, {
					method: "PUT",
					headers: {
						Authorization: `Bearer ${authToken}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						active: newStatus,
					}),
				})
					.then((response) => {
						if (response.ok) {
							setItems((prevItems) =>
								prevItems.map((item) =>
									item.id === id ? { ...item, active: newStatus } : item
								)
							);
							toast.success("User status updated successfully");
						} else {
							console.error("Error updating item:", response.statusText);
							toast.error("Failed to update user status");
						}
					})
					.catch((error) => {
						console.error("Error updating item:", error);
						toast.error("Failed to update user status");
					});
			}
		});
	};

	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(event.target.value);
	};

	const filteredItems = items.filter(
		(item) =>
			item.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			item.email.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<>
			<div className="card">
				<div className="card-header border-0 pt-5">
					<div className="d-flex">

					<h3 className="card-title align-items-start flex-column">
						<span className="card-label fw-bold fs-3 mb-1">Users</span>
					</h3>

					<div className="d-flex align-items-center position-relative mx-3">
						<KTIcon
							iconName="magnifier"
							className="fs-1 position-absolute ms-6"
						/>
						<input
							type="text"
							data-kt-user-table-filter="search"
							className="form-control form-control-solid w-250px ps-14"
							placeholder="Search User"
							value={searchQuery}
							onChange={handleSearchChange}
						/>
					</div>
					</div>
					<div className="card-toolbar">
										<a
											className="btn btn-sm btn-light-primary"
											data-bs-toggle="modal"
											data-bs-target="#kt_modal_add_admin"
										>
											<KTIcon iconName="plus" className="fs-2" />
											Add New Admin
										</a>
					
										<AddAdmin onAddSuccess={() => fetchUsers(page)} />
									</div>
				</div>

				<div className="card-body py-4">
					<div className="table-responsive">
						<table className="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4">
							<thead>
								<tr className="text-start text-muted bg-light fw-bolder fs-7 text-uppercase gs-0 border-bottom">
									<th className="w-10px pe-2">No.</th>
									<th className="min-w-125px">Name</th>
									<th className="min-w-125px">Email</th>
									<th className="min-w-125px">Role</th>
									<th className="min-w-125px">Active</th>
									<th className="min-w-125px">Joined Date</th>
									<th className="text-end min-w-100px">Actions</th>
								</tr>
							</thead>
							<tbody className="text-gray-600 fw-bold">
								{filteredItems.map((item, index) => (
									<tr key={item.id}>
										<td>{index + 1}</td>
										<td>
											<div className="d-flex align-items-center">
												<div className="d-flex flex-column">
													<a
														href="#"
														className="text-gray-800 text-hover-primary mb-1"
													>
														{item.userName}
													</a>
												</div>
											</div>
										</td>
										<td>{item.email}</td>
										<td><div className="badge badge-light fw-bolder fs-6">{item.role}</div> </td>
										<td>
											{item.active ? (
												<div className="badge badge-light-success fs-6">Active</div>
											) : (
												<div className="badge badge-light-danger fs-6">Inactive</div>
											)}
										</td>
										<td>{new Date(item.createdAt).toLocaleDateString()}</td>
										<td className="text-end min-w-100px">
											<a
												href="#"
												className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1"
												onClick={() => handleToggleActive(item.id, item.active)}
											>
												<KTIcon iconName="switch" className="fs-3" />
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
							usersId={selectedUserId}
							onEditSuccess={() => fetchUsers(page)}
						/>
					</div>
					<div className="d-flex justify-content-start align-items-center mt-4">
						<button
							className="btn btn-light-primary"
							disabled={page === 0}
							onClick={() => fetchUsers(page - 1)}
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
									onClick={() => fetchUsers(index)}
								>
									{index + 1}
								</button>
							))}
						</div>
						<button
							className="btn btn-light-primary"
							disabled={page === totalPages - 1}
							onClick={() => fetchUsers(page + 1)}
						>
							Next
						</button>
					</div>
				</div>
				<ToastContainer />
			</div>
		</>
	);
};

export { UsersTable };
