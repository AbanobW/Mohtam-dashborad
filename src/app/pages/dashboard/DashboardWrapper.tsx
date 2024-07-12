import { useEffect } from "react";
import { useIntl } from "react-intl";
import { PageTitle } from "../../../_metronic/layout/core";
import { StatisticsWidget5 } from "../../../_metronic/partials/widgets";
import { Toolbar } from "../../../_metronic/layout/components/toolbar/Toolbar";
import { Content } from "../../../_metronic/layout/components/Content";

const DashboardPage = () => {
	useEffect(() => {
		// We have to show toolbar only for dashboard page
		document.getElementById("kt_layout_toolbar")?.classList.remove("d-none");
		return () => {
			document.getElementById("kt_layout_toolbar")?.classList.add("d-none");
		};
	}, []);

	return (
		<>
		<div className="js-widget echo-chat-widget">
		</div>
			<Toolbar />
			<Content>
				<PageTitle breadcrumbs={[]} description="">
					Dashboard
				</PageTitle>
				{/* begin::Row */}
				<div className="row g-5 g-xl-8">
					<div className="col-xl-4">
						<StatisticsWidget5
							className="card-xl-stretch mb-xl-8"
							svgIcon="basket"
							color="danger"
							iconColor="white"
							title="Tents"
							titleColor="white"
							description="Our Tents"
							descriptionColor="white"
							link="/subjects"
						/>
					</div>

					<div className="col-xl-4">
						<StatisticsWidget5
							className="card-xl-stretch mb-xl-8"
							svgIcon="cheque"
							color="info"
							iconColor="white"
							title="Camp Fires"
							titleColor="white"
							descriptionColor="white"
							description="Our Camp Fires"
							link="/articles"
						/>
					</div>

					<div className="col-xl-4">
						<StatisticsWidget5
							className="card-xl-stretch mb-5 mb-xl-8"
							svgIcon="profile-user"
							color="success"
							iconColor="white"
							titleColor="white"
							descriptionColor="white"
							title="Users"
							description="Users"
							link="/users"
						/>
					</div>
				</div>
				{/* end::Row */}
			</Content>
		</>
	);
};

const DashboardWrapper = () => {
	const intl = useIntl();
	return (
		<>
			<PageTitle breadcrumbs={[]}>
				{intl.formatMessage({ id: "MENU.DASHBOARD" })}
			</PageTitle>
			<DashboardPage />
		</>
	);
};

export { DashboardWrapper };
