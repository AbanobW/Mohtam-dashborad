import React, { useState, useEffect } from "react";
import { KTIcon } from "../../../_metronic/helpers";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../auth";

type EditProps = {
	tagId: string | null;
	onEditSuccess: () => void;
};

export const Edit: React.FC<EditProps> = ({ tagId, onEditSuccess }) => {
	const { auth } = useAuth();
	const authToken = auth?.accessToken;
	const [formData, setFormData] = useState({
		name: "",
	});

	useEffect(() => {
		if (tagId) {
			fetch(`http://167.172.165.109:8080/api/v1/admin/tags/${tagId}`, {
				headers: {
					Authorization: `Bearer ${authToken}`,
					"Content-Type": "application/json",
				},
			})
				.then((response) => response.json())
				.then((data) => {
					setFormData({
						name: data.name,
					});
				})
				.catch((error) => console.error("Error fetching tag data:", error));
		}
	}, [tagId, authToken]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]: value,
		});
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		// Check if any field is empty
		if (!formData.name) {
			toast.error("All fields are required. Please fill in all fields.", {
				position: "top-right",
				autoClose: 3000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
			});
			return;
		}

		try {
			const response = await fetch(
				`http://167.172.165.109:8080/api/v1/admin/tags/${tagId}`,
				{
					method: "PUT",
					headers: {
						Authorization: `Bearer ${authToken}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						name: formData.name,
					}),
				}
			);

			if (!response.ok) {
				throw new Error("Failed to update tag");
			}

			// Clear form inputs
			setFormData({
				name: "",
			});

			// Show success toast and close modal
			toast.success("Tag updated successfully!", {
				position: "top-right",
				autoClose: 3000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
			});

			// Call the callback function to refresh the table
			if (onEditSuccess) {
				onEditSuccess();
			}
		} catch (error) {
			console.error("Error updating tag:", error);
			// Show error toast
			toast.error("Failed to update tag. Please try again later.", {
				position: "top-right",
				autoClose: 3000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
			});
		}
	};

	return (
		<>
			<div
				className="modal fade"
				id="kt_modal_edit_Sub"
				tabIndex={-1}
				aria-hidden="true"
			>
				<div className="modal-dialog mw-650px">
					<div className="modal-content">
						<div className="modal-header pb-0 border-0 justify-content-end">
							<button
								type="button"
								className="btn btn-sm btn-icon btn-active-color-primary"
								data-bs-dismiss="modal"
								aria-label="Close"
							>
								<KTIcon iconName="cross" className="fs-1" />
							</button>
						</div>
						<div className="modal-body scroll-y pt-0 pb-15">
							<div className="text-center mb-13">
								<h1 className="mb-3">Edit Tag</h1>
							</div>
							<form
								className="form w-100"
								noValidate
								id="kt_edit_form"
								onSubmit={handleSubmit}
							>
								<div className="container">
									<div className="row">
										<div className="col-md-12">
											<label className="required fs-5 fw-semibold mb-2">
												Title
											</label>
											<input
												type="text"
												className="form-control form-control-solid mb-3 mb-lg-0"
												name="name"
												value={formData.name}
												onChange={handleChange}
											/>
										</div>

										<div className="col-md-12 mt-5 text-center">
											<button
												type="submit"
												id="kt_sign_in_submit"
												className="btn btn-primary"
											>
												Submit
											</button>
											<button
												type="button"
												className="btn btn-dark ms-3"
												data-bs-dismiss="modal"
											>
												Close
											</button>
										</div>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
			<ToastContainer />
		</>
	);
};
