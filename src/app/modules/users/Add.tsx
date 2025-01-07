/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { KTIcon } from "../../../_metronic/helpers";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createAdmin } from "../auth/core/_requests";

interface AddAdminProps {
  onAddSuccess: () => void;
}

export const AddAdmin: React.FC<AddAdminProps> = ({ onAddSuccess }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    // Validate form inputs
    if (!formData.email || !formData.password) {
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
      // Create admin using createAdmin function
      await createAdmin(formData.email, formData.password);

      // Clear form inputs
      setFormData({
        email: "",
        password: "",
      });

      // Show success toast
      toast.success("Admin created successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      // Call the callback function to refresh the admin list
      if (onAddSuccess) {
        onAddSuccess();
      }
    } catch (error) {
      console.error("Error creating admin:", error);
      toast.error("Failed to create admin. Please try again later.", {
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
        id="kt_modal_add_admin"
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
                <h1 className="mb-3">Add New Admin</h1>
              </div>
              <form
                className="form w-100"
                noValidate
                id="kt_add_admin_form"
                onSubmit={handleSubmit}
              >
                <div className="container">
                  <div className="row">
                    <div className="col-md-12">
                      <label className="required fs-5 fw-semibold mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        className="form-control form-control-solid mb-3 mb-lg-0"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-12">
                      <label className="required fs-5 fw-semibold mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        className="form-control form-control-solid mb-3 mb-lg-0"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-12 mt-5 text-center">
                      <button
                        type="submit"
                        id="kt_add_admin_submit"
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
