import React, { useState, useRef } from "react";
import { KTIcon } from "../../../_metronic/helpers";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../auth";

interface AddProps {
	onAddSuccess: () => void;
}

interface FormData {
	title: string;
	description: string;
	image: File | null;
}

export const Add: React.FC<AddProps> = ({ onAddSuccess }) => {
	const { auth } = useAuth();
	const authToken = auth?.accessToken;
	const [formData, setFormData] = useState<FormData>({
		title: "",
		description: "",
		image: null,
	});
	const fileInputRef = useRef<HTMLInputElement>(null);
	const apiUrl = import.meta.env.VITE_APP_API_URL;

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		// Validation for title and description length
		if (formData.title.length < 3) {
			toast.error("Title must be at least 3 characters long.", {
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

		if (formData.description.length < 10) {
			toast.error("Description must be at least 10 characters long.", {
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
			const presignedUrlResponse = await fetch(`${apiUrl}/presignedurls`, {
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
			const imgUrl = import.meta.env.VITE_APP_Img_URL;

			// Upload the image using the presigned URL
			const uploadResponse = await fetch(presignedUrl, {
				method: "PUT",
				body: formData.image,
			});

			if (!uploadResponse.ok) {
				throw new Error("Failed to upload image");
			}

			// Proceed to add the subject
			const response = await fetch(`${apiUrl}/subjects`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${authToken}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					title: formData.title,
					description: formData.description,
					coverImageUrl: imgUrl + fileId,
				}),
			});

			if (!response.ok) {
				// Extract and display the specific error message from the API response
				const errorData = await response.json();
				const errorMessage = errorData.message || "Failed to add tent.";
				throw new Error(errorMessage);
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
			toast.success("Tent added successfully!", {
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
			console.error("Error adding tent:", error);
			// Handle error of type unknown by checking if it's an instance of Error
			if (error instanceof Error) {
				toast.error(error.message, {
					position: "top-right",
					autoClose: 3000,
					hideProgressBar: false,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
					progress: undefined,
				});
			} else {
				// Handle unexpected errors
				toast.error("An unexpected error occurred", {
					position: "top-right",
					autoClose: 3000,
					hideProgressBar: false,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
					progress: undefined,
				});
			}
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
								<h1 className="mb-3">Add New Tent</h1>
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
