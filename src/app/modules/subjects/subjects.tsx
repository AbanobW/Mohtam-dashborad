/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { useIntl } from "react-intl";
import { PageDataProvider, PageTitle } from "../../../_metronic/layout/core";
import DataTableExample from "../apps/datatable/datatable";
import { TableColumn } from "react-data-table-component";
// import {Add} from './Add'
// import {Edit} from './Edit'
import { deleteAction, actionsDetails } from "../CrudActions/index";
import { Toolbar } from "../../../_metronic/layout/components/toolbar/Toolbar";
import { SubjectsTable } from "../../../_metronic/partials/widgets/tables/SubjectsTable";
import { Content } from "../../../_metronic/layout/components/Content";
import { AsideDefault } from "../../../_metronic/layout/components/aside/AsideDefault";
import { MasterLayout } from "../../../_metronic/layout/MasterLayout";
import { Outlet } from "react-router-dom";
import { Footer } from "../../../_metronic/layout/components/Footer";
import { HeaderWrapper } from "../../../_metronic/layout/components/header/HeaderWrapper";
import { ScrollTop } from "../../../_metronic/layout/components/ScrollTop";
import {
	ActivityDrawer,
	DrawerMessenger,
	InviteUsers,
	UpgradePlan,
} from "../../../_metronic/partials";
import { Toolbar2 } from "../../../_metronic/layout/components/toolbar/Toolbar2";

const SubjectsPage = () => {
	return (
		<PageDataProvider>
			<div className="d-flex flex-column flex-root">
				{/* begin::Page */}
				<div className="page d-flex flex-row flex-column-fluid">
					<AsideDefault />
					{/* begin::Wrapper */}
					<div
						className="wrapper d-flex flex-column flex-row-fluid"
						id="kt_wrapper"
					>
						<HeaderWrapper />
						{/* begin::Content */}
						<div
							id="kt_content"
							className="content d-flex flex-column flex-column-fluid"
						>
							<Outlet />
							<Toolbar2 />

							<Content>
								<div className="g-5 gx-xxl-8">
									<SubjectsTable className="" />
								</div>
							</Content>
						</div>
						{/* end::Content */}
						<Footer />
					</div>
					{/* end::Wrapper */}
				</div>
				{/* end::Page */}
			</div>

			{/* begin:: Drawers */}
			<ActivityDrawer />
			{/* <RightToolbar /> */}
			<DrawerMessenger />
			{/* end:: Drawers */}

			{/* begin:: Modals */}
			<InviteUsers />
			<UpgradePlan />
			{/* end:: Modals */}
			<ScrollTop />
		</PageDataProvider>
	);
};

const SubjectsWrapper = () => {
	const intl = useIntl();
	return (
		<>
			<PageTitle breadcrumbs={[]}>Subjects</PageTitle>
			<SubjectsPage />
		</>
	);
};

export { SubjectsWrapper };
