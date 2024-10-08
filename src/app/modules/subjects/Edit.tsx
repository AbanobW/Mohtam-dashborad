import React, { useState, useEffect, useRef } from "react";
import { KTIcon } from "../../../_metronic/helpers";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../auth";

type EditProps = {
	subjectId: string | null;
	onEditSuccess: () => void;
};

export const Edit: React.FC<EditProps> = ({ subjectId, onEditSuccess }) => {
	const { auth } = useAuth();
	const authToken = auth?.accessToken;
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		coverImageUrl: "",
	});
	const [imageUrl, setImageUrl] = useState<string | null>(null); // Changed to allow null initially
	const fileInputRef = useRef<HTMLInputElement>(null);

	const apiUrl = import.meta.env.VITE_APP_API_URL;
	const imgUrl = import.meta.env.VITE_APP_Img_URL;


	useEffect(() => {
		if (subjectId) {
			fetch(`${apiUrl}/subjects/${subjectId}`, {
				headers: {
					Authorization: `Bearer ${authToken}`,
					"Content-Type": "application/json",
				},
			})
				.then((response) => response.json())
				.then((data) => {
					setFormData({
						title: data.title,
						description: data.description,
						coverImageUrl: data.coverImageUrl,
					});

					// Fetch the presigned URL for the cover image
					fetch(
						`${apiUrl}/presignedurls/${data.coverImageUrl}`,
						{
							headers: {
								Authorization: `Bearer ${authToken}`,
								"Content-Type": "application/json",
							},
						}
					)
						.then((response) => response.json())
						.then((imgData) => setImageUrl(imgData.presignedUrl))
						.catch((error) =>
							console.error("Error fetching image URL:", error)
						);
				})
				.catch((error) => console.error("Error fetching subject data:", error));
		}
	}, [subjectId]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]: value,
		});
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files && e.target.files[0];
		if (file) {
			try {
				// Get presigned URL for uploading
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
				if (!presignedUrlResponse.ok) {
					throw new Error("Failed to get presigned URL");
				}
				const presignedUrlData = await presignedUrlResponse.json();
				const presignedUrl = presignedUrlData.presignedUrl;
				const fileId = presignedUrlData.fileId;

				// Upload the file using the presigned URL
				await fetch(presignedUrl, {
					method: "PUT",
					body: file,
				});

				// Update state with the new coverImageUrl and presignedUrl
				setFormData({
					...formData,
					coverImageUrl: imgUrl + fileId,
				});
				setImageUrl(presignedUrl); // Update imageUrl state with the new URL
			} catch (error) {
				console.error("Error uploading image:", error);
				toast.error("Failed to upload image. Please try again later.", {
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
		if (!formData.title || !formData.description || !formData.coverImageUrl) {
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
				`${apiUrl}/subjects/${subjectId}`,
				{
					method: "PUT",

					headers: {
						Authorization: `Bearer ${authToken}`,
						"Content-Type": "application/json",
					},

					body: JSON.stringify({
						title: formData.title,
						description: formData.description,
						coverImageUrl: formData.coverImageUrl,
					}),
				}
			);

			if (!response.ok) {
				throw new Error("Failed to update subject");
			}

			// Clear form inputs
			setFormData({
				title: "",
				description: "",
				coverImageUrl: "",
			});

			// Reset file input
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}

			// Show success toast and close modal
			toast.success("Tent updated successfully!", {
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
			console.error("Error updating tent:", error);
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
								<h1 className="mb-3">Edit Tent</h1>
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
											{imageUrl && (
												<img
													src={imageUrl}
													alt="Cover"
													className="mb-3"
													style={{
														width: "100%",
														maxHeight: "300px",
														objectFit: "contain",
													}}
												/>
											)}
											<input
												type="file"
												ref={fileInputRef}
												onChange={handleFileChange}
												className="form-control"
												name="coverImage"
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
