/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef } from "react";
import { KTIcon } from "../../../_metronic/helpers";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../auth";

export const Add = ({ onAddSuccess }) => {
	const { auth } = useAuth();
	const authToken = auth?.accessToken;
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		image: null,
	});
	const fileInputRef = useRef(null);

	const handleChange = (e: { target: { name: any; value: any } }) => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]: value,
		});
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files && e.target.files[0];
		if (file) {
			setFormData({
				...formData,
				image: file,
			});
		}
	};

	const handleSubmit = async (e: { preventDefault: () => void }) => {
		e.preventDefault();

		// Check if any field is empty
		if (!formData.title || !formData.description || !formData.image) {
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
			// Request presigned URL and file ID
			const presignedUrlResponse = await fetch("http://167.172.165.109:8080/api/v1/presignedurls", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${authToken}`,
					"Content-Type": "application/json",
				},
			});

			if (!presignedUrlResponse.ok) {
				throw new Error("Failed to get presigned URL");
			}

			const presignedUrlData = await presignedUrlResponse.json();
			const presignedUrl = presignedUrlData.presignedUrl;
			const fileId = presignedUrlData.fileId;

			// Upload the image using the presigned URL
			const uploadResponse = await fetch(presignedUrl, {
				method: "PUT",
				body: formData.image,
			});

			if (!uploadResponse.ok) {
				throw new Error("Failed to upload image");
			}

			// Proceed to add the tag
			const response = await fetch("http://167.172.165.109:8080/api/v1/subjects", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${authToken}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					title: formData.title,
					description: formData.description,
					coverImageId: fileId,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to add tag");
			}

			// Clear form inputs
			setFormData({
				title: "",
				description: "",
				image: null,
			});

			// Reset file input
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}

			// Show success toast and close modal
			toast.success("Tag added successfully!", {
				position: "top-right",
				autoClose: 3000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
			});

			// Call the callback function to refresh the table
			if (onAddSuccess) {
				onAddSuccess();
			}
		} catch (error) {
			console.error("Error adding tag:", error);
			// Show error toast
			toast.error("Failed to add tag. Please try again later.", {
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
				id="kt_modal_add_Sub"
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
								<h1 className="mb-3">Add New Tag</h1>
							</div>
							<form
								className="form w-100"
								noValidate
								id="kt_add_form"
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
												name="title"
												value={formData.title}
												onChange={handleChange}
											/>
										</div>
										<div className="col-md-12 mt-3">
											<label className="required fs-5 fw-semibold mb-2">
												Description
											</label>
											<input
												type="text"
												className="form-control form-control-solid mb-3 mb-lg-0"
												name="description"
												value={formData.description}
												onChange={handleChange}
											/>
										</div>
										<div className="col-md-12 mt-3">
											<label className="required fs-5 fw-semibold mb-2">
												Cover Image
											</label>
											<input
												type="file"
												ref={fileInputRef}
												onChange={handleFileChange}
												className="form-control"
												name="image"
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
