/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState} from 'react';
import DataTable, { TableColumn } from 'react-data-table-component';
import { KTIcon } from '../../../../_metronic/helpers';
import { useAuthenticatedRequest } from '../../Components/Requests';
import {Link} from 'react-router-dom'

interface DataTableProps {
  endpoint: string;
  columns: TableColumn<any>[];
  cardTitle: string;
  addButtonLabel: string;
  ModalAdd: string;
  actionsColumn: TableColumn<any>;
  change: boolean;
}

// const customStyles = {
//   rows: {},
//   headCells: {
//     style: {
//       paddingLeft: '8px',
//       paddingRight: '8px',
//       fontWeight: 800,
//     },
//   },
//   cells: {
//     style: {
//       width: '60px',
//       textTransform: 'capitalize'
//     },
//   },
// };

const DataTableExample: React.FC<DataTableProps> = ({ endpoint, columns, cardTitle, addButtonLabel, ModalAdd, actionsColumn, change }) => {
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    limit: 10,
    totalPages: 0,
    totalResults: 0,
    currentPage: 1,
  });
  const [selectAllRows] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    fetchData(endpoint, pagination.currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, pagination.currentPage, change]);

  const { getRequest } = useAuthenticatedRequest();

  const fetchData = async (url: string, page: number) => {
    try {
      const response = await getRequest(url, {
        page: page.toString(),
      });
      setData(response.data);
      setPagination({
        limit: response.limit,
        totalPages: response.totalPages,
        totalResults: response.totalResults,
        currentPage: page,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousPage = () => {
    if (pagination.currentPage > 1) {
      const newPage = pagination.currentPage - 1;
      setPagination({ ...pagination, currentPage: newPage });
      fetchData(endpoint, newPage);
    }
  };

  const handleNextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      const newPage = pagination.currentPage + 1;
      setPagination({ ...pagination, currentPage: newPage });
      fetchData(endpoint, newPage);
    }
  };

  const columnsWithActions = [...columns, actionsColumn];

  const checkboxStyles = {
    backgroundSize: '60% 60%',
  };

  const selectProps = {
    indeterminate: selectAllRows,
    class: 'form-check-input',
    style: checkboxStyles,
  };

  return (
    <div className="card mb-5 mb-xl-8">
      <div className='card-header border-0 pt-5'>
        <h3 className='card-title align-items-start flex-column'>
          <span className='card-label fw-bold fs-3 mb-1'>{cardTitle}</span>
        </h3>
        <div className='card-toolbar'>
          <Link className='btn btn-sm btn-light-primary' data-bs-toggle='modal' data-bs-target={ModalAdd} to={ModalAdd}>
            <KTIcon iconName='plus' className='fs-3' />
            {addButtonLabel}
          </Link>
        </div>
      </div>
      <div className='card-body py-3'>
        {loading ? (
          <div className="text-center">
            <p>Loading data...</p>
          </div>
        ) : (
          <div className='table-responsive'>
            <DataTable
              columns={columnsWithActions}
              data={data}
              responsive
              pagination
              paginationServer
              paginationTotalRows={pagination.totalResults}
              paginationPerPage={pagination.limit}
              onChangePage={() => {}} // Disable default pagination
              paginationComponent={() => (
                
                  <div className="pagination-buttons d-flex mt-5" style={{justifyContent:'space-between'}}>
                    <div>Showing {pagination.limit * (pagination.currentPage - 1) + 1} to {pagination.limit * pagination.currentPage} of {pagination.totalResults} results</div>
                    {pagination.totalPages > 1 ? (
                    <div>
                      <button onClick={handlePreviousPage} disabled={pagination.currentPage === 1} className='btn btn-secondary btn-sm'>Previous</button>
                      <button onClick={handleNextPage} disabled={pagination.currentPage === pagination.totalPages} className='btn btn-secondary ms-4 btn-sm'>Next</button>
                    </div>) : null
                    }
                  </div>
                
              )}
              // selectableRows
              selectableRowsComponentProps={selectProps}
              // customStyles={customStyles}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DataTableExample;
