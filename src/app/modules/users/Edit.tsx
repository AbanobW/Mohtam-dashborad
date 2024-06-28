import React, { useState, useEffect, useRef } from "react";
import { KTIcon } from "../../../_metronic/helpers";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../auth";

type EditProps = {
	usersId: string | null;
	onEditSuccess: () => void;
};

export const Edit: React.FC<EditProps> = ({ usersId, onEditSuccess }) => {
	const { auth } = useAuth();
	const authToken = auth?.accessToken;
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		coverImageId: "",
	});
	const [imageUrl, setImageUrl] = useState<string | null>(null); // Changed to allow null initially
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			try {
				const response = await fetch(
					"http://167.172.165.109:8080/api/v1/admin/attachments/presigned-url",
					{
						method: "POST",
						headers: {
							Authorization: `Bearer ${authToken}`,
							"Content-Type": "application/json",
						},
					}
				);

				const data = await response.json();
				const { url, key } = data;

				await fetch(url, {
					method: "PUT",
					headers: {
						"Content-Type": "multipart/form-data",
					},
					body: file,
				});

				setImageUrl(url.split("?")[0]);
				setFormData((prevData) => ({ ...prevData, coverImageId: key }));

				toast.success("Image uploaded successfully");
			} catch (error) {
				console.error("Error uploading image:", error);
				toast.error("Failed to upload image");
			}
		}
	};

	useEffect(() => {
		if (usersId) {
			const fetchUserDetails = async () => {
				try {
					const response = await fetch(
						`http://167.172.165.109:8080/api/v1/admin/users/${usersId}`,
						{
							headers: {
								Authorization: `Bearer ${authToken}`,
								"Content-Type": "application/json",
							},
						}
					);
					const data = await response.json();
					setFormData({
						title: data.title,
						description: data.description,
						coverImageId: data.coverImageId,
					});
					setImageUrl(data.coverImageUrl); // Changed to handle null or undefined values
				} catch (error) {
					console.error("Error fetching user details:", error);
				}
			};

			fetchUserDetails();
		}
	}, [usersId, authToken]);

	const handleInputChange = (
		event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = event.target;
		setFormData((prevData) => ({ ...prevData, [name]: value }));
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		try {
			const response = await fetch(
				`http://167.172.165.109:8080/api/v1/admin/users/${usersId}`,
				{
					method: "PATCH",
					headers: {
						Authorization: `Bearer ${authToken}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify(formData),
				}
			);

			if (response.ok) {
				toast.success("User updated successfully");
				onEditSuccess();
			} else {
				const errorData = await response.json();
				const errorMessage = errorData.message || "Failed to update user";
				toast.error(errorMessage);
			}
		} catch (error) {
			console.error("Error updating user:", error);
			toast.error("Failed to update user");
		}
	};

	const handleButtonClick = () => {
		fileInputRef.current?.click();
	};

	return (
		<>
			<div
				className="modal fade"
				id="kt_modal_edit_User"
				tabIndex={-1}
				aria-hidden="true"
			>
				<div className="modal-dialog modal-dialog-centered mw-650px">
					<div className="modal-content">
						<div className="modal-header justify-content-between" id="kt_modal_add_User_header">
							<h2 className="fw-bold">Edit User</h2>
							<div
								className="btn btn-icon btn-sm btn-active-icon-primary"
								data-bs-dismiss="modal"
								aria-label="Close"
							>
								<KTIcon iconName="cross" className="fs-1" />
							</div>
						</div>
						<div className="modal-body scroll-y mx-5 mx-xl-15 my-7">
							<form
								id="kt_modal_edit_User_form"
								className="form"
								onSubmit={handleSubmit}
							>
								<div className="d-flex flex-column scroll-y me-n7 pe-7">
									<div className="fv-row mb-7">
										<label className="d-block fw-semibold fs-6 mb-5">Avatar</label>
										<div className="image-input image-input-outline image-input-placeholder">
											<div
												className="image-input-wrapper w-125px h-125px"
												style={{ backgroundImage: `url('${imageUrl}')` }}
											></div>

											<label
												className="btn btn-icon btn-circle btn-active-color-primary w-25px h-25px bg-body shadow"
												data-kt-image-input-action="change"
												data-bs-toggle="tooltip"
												title="Change avatar"
												onClick={handleButtonClick}
											>
												<KTIcon iconName="pencil" className="fs-7" />
												<input
													type="file"
													name="avatar"
													accept=".png, .jpg, .jpeg"
													ref={fileInputRef}
													style={{ display: "none" }}
													onChange={handleFileChange}
												/>
											</label>

											<span
												className="btn btn-icon btn-circle btn-active-color-primary w-25px h-25px bg-body shadow"
												data-kt-image-input-action="cancel"
												data-bs-toggle="tooltip"
												title="Cancel avatar"
											>
												<KTIcon iconName="cross" className="fs-2" />
											</span>
										</div>
									</div>
									<div className="fv-row mb-7">
										<label className="required fw-semibold fs-6 mb-2">
											Title
										</label>
										<input
											type="text"
											className="form-control form-control-solid mb-3 mb-lg-0"
											name="title"
											placeholder="Title"
											value={formData.title}
											onChange={handleInputChange}
										/>
									</div>
									<div className="fv-row mb-7">
										<label className="required fw-semibold fs-6 mb-2">
											Description
										</label>
										<textarea
											className="form-control form-control-solid mb-3 mb-lg-0"
											name="description"
											placeholder="Description"
											value={formData.description}
											onChange={handleInputChange}
										/>
									</div>
								</div>
								<div className="text-center pt-15">
									<button
										type="reset"
										className="btn btn-light me-3"
										data-bs-dismiss="modal"
									>
										Discard
									</button>
									<button
										type="submit"
										className="btn btn-primary"
										data-bs-dismiss="modal"
									>
										<span className="indicator-label">Submit</span>
									</button>
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
