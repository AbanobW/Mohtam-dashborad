/* eslint-disable @typescript-eslint/no-explicit-any */
import Swal from 'sweetalert2'
import axios from 'axios'
import {KTIcon} from '../../../_metronic/helpers'
import {Link} from 'react-router-dom'
import {toast} from 'react-toastify'
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const API_URL = "https://preview.keenthemes.com/metronic8/laravel/api" ;

export const deleteAction = (
  url: string,
  type: string,
  setChange: any,
  change: boolean,
  successCallback: () => void
) => {
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#933d8b',
    cancelButtonColor: '#000',
    confirmButtonText: `Yes, delete it !`,
  }).then((result) => {
    if (result.isConfirmed) {
      axios
        .delete(url)
        .then(() => {
          // Call the success callback
          successCallback()
          // Optionally, update the state to trigger a re-render
          setChange(!change)
        })
        .catch((error) => {
          Swal.fire(`${error.response.data.message}`, 'error')
        })
    }
  })
}

export const changeStatusAction = (
  url: string,
  setChange: any,
  payload: any,
  change: boolean,
  successCallback: () => void
) => {
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#933d8b',
    cancelButtonColor: '#000',
    confirmButtonText: `Yes, change it !`,
  }).then((result) => {
    if (result.isConfirmed) {
      axios
        .delete(url, { data: payload })
        .then(() => {
          // Call the success callback
          successCallback()
          // Optionally, update the state to trigger a re-render
          setChange(!change)
        })
        .catch((error) => {
          Swal.fire(`${error.response.data.message}`, 'error')
        })
    }
  })
}


export const actionsDetails = (
  deleteColumn: any,
  endpoint: any,
  setChange: any,
  change: any,
  ModalEdit: any,
  rowID: any,
  setSelectedRowId: (id: number | null) => void
) => {
  const handleEditClick = (rowID: number) => {
    setSelectedRowId(rowID)
    setChange(!change)
  }

  return {
    name: 'Actions',
    cell: (row: any) => (
      <div>
         {endpoint !== '/v1/cables/admin/seo' ? (
        <OverlayTrigger
            placement='top'
            overlay={<Tooltip id='tooltip-change-status'>Change Status</Tooltip>}
          >
            <button
              onClick={() => {
                const newStatus = row.status === 'approved' ? 'suspended' : 'approved';
                changeStatusAction(
                  API_URL + endpoint + '/' + row.id,
                  setChange,
                  { status: newStatus },
                  change,
                  () => {
                    toast.success(`Change status to ${newStatus} successfully`, {
                      autoClose: 2000,
                      closeOnClick: true,
                      hideProgressBar: true,
                      pauseOnHover: false,
                      theme: 'colored',
                    });
                  }
                );
              }}
              className='btn btn-icon btn-bg-light btn-active-color-primary btn-sm mb-2 me-1'
            >
              <KTIcon iconName='switch' className='fs-3' />
            </button>
          </OverlayTrigger>
        ):""}
        {endpoint === '/v1/cables/admin/projects' ? (
          <OverlayTrigger
          placement='top'
          overlay={<Tooltip id='tooltip-change-status'>Images</Tooltip>}
        >
         <Link
            className='btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1'
            to={`/images/${row.id}`}
          >
            <KTIcon iconName='abstract-26' className='fs-3' />
          </Link>
        </OverlayTrigger>
        ) : (
          ''
        )}
        <OverlayTrigger
          placement='top'
          overlay={<Tooltip id='tooltip-change-status'>Edit</Tooltip>}
        >
        <Link
          className='btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1'
          data-bs-toggle='modal'
          data-bs-target={ModalEdit}
          to={`${ModalEdit}/${row.id}`}
          onClick={() => handleEditClick(row.id)}
        >
          <KTIcon iconName='pencil' className='fs-3' />
        </Link>
        </OverlayTrigger>
        <OverlayTrigger
          placement='top'
          overlay={<Tooltip id='tooltip-change-status'>Delete</Tooltip>}
        >
        <button
          onClick={() => {
            deleteAction(API_URL + endpoint + '/' + row.id, '', setChange, change, () => {
              toast.success('Deleted successfully', {
                autoClose: 2000,
                closeOnClick: true,
                hideProgressBar: true,
                pauseOnHover: false,
                theme: 'colored',
              })
            })
          }}
          className='btn btn-icon btn-bg-light btn-active-color-primary btn-sm'
        >
          <KTIcon iconName='trash' className='fs-3' />
        </button>
        </OverlayTrigger>
      </div>
    ),
  }
}
