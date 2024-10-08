/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { KTIcon } from "../../../helpers";
import { Link } from "react-router-dom";

type Props = {
	className: string;
	color: string;
	svgIcon: string;
	iconColor: string;
	title: string;
	titleColor?: string;
	description: string;
	descriptionColor?: string;
	link?: string;
	customIcon?: React.ReactNode | string; // Update the type of customIcon
};

const StatisticsWidget5: React.FC<Props> = ({
	className,
	color,
	svgIcon,
	iconColor,
	title,
	titleColor,
	description,
	descriptionColor,
	link,
	customIcon,
}) => {
	const cardContent = (
		<div className="card-body">
			{typeof customIcon === "string" ? (
				<img
					src={customIcon}
					alt=""
					className={`text-${iconColor} fs-3x ms-n1`}
				/>
			) : (
				<KTIcon
					iconName={svgIcon}
					className={`text-${iconColor} fs-3x ms-n1`}
				/>
			)}

			<div className={`text-${titleColor ?? "white"} fw-bold fs-2 mb-2 mt-5`}>
				{title}
			</div>

			<div className={`fw-semibold text-${descriptionColor ?? "white"}`}>
				{description}
			</div>
		</div>
	);

	return link ? (
		<Link to={link} className={`card bg-${color} hoverable ${className}`}>
			{cardContent}
		</Link>
	) : (
		<div className={`card bg-${color} ${className}`}>{cardContent}</div>
	);
};

export { StatisticsWidget5 };
