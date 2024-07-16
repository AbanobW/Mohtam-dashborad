/**
 * High level router.
 *
 * Note: It's recommended to compose related routes in internal router
 * components (e.g: `src/app/modules/Auth/pages/AuthPage`, `src/app/BasePage`).
 */

import { FC } from "react";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import { PrivateRoutes } from "./PrivateRoutes";
import { ErrorsPage } from "../modules/errors/ErrorsPage";
import { Logout, AuthPage, useAuth } from "../modules/auth";
import { App } from "../App";
import { ArticlesWrapper } from "../modules/articles/articles";
import { AddArticlesWrapper } from "../modules/articles/Add";
import { EditArticlesWrapper } from "../modules/articles/Edit";
import { UsersWrapper } from "../modules/users/users";
import { TagsWrapper } from "../modules/tags/tags";
import { ChatWrapper } from "../modules/chat/chat";
import { SubjectsWrapper } from "../pages/subjects/SubjectsWrapper";

/**
 * Base URL of the website.
 *
 * @see https://facebook.github.io/create-react-app/docs/using-the-public-folder
 */
const { BASE_URL } = import.meta.env;

const AppRoutes: FC = () => {
	const { currentUser } = useAuth();
	return (
		<BrowserRouter basename={BASE_URL}>
			<Routes>
				<Route element={<App />}>
					{currentUser ? (
						<>
							<Route path="/*" element={<PrivateRoutes />} />
							<Route index element={<Navigate to="/dashboard" />} />
							<Route path="chat" element={<ChatWrapper />} />
							<Route path="users" element={<UsersWrapper />} />
							<Route path="tags" element={<TagsWrapper />} />
							<Route path="subjects" element={<SubjectsWrapper />} />
							<Route path="articles" element={<ArticlesWrapper />} />
							<Route path="addArticle" element={<AddArticlesWrapper />} />
							<Route path="editArticle" element={<EditArticlesWrapper />} />
							<Route path="error/*" element={<ErrorsPage />} />
							<Route path="logout" element={<Logout />} />
						</>
					) : (
						<>
							<Route path="auth/*" element={<AuthPage />} />
							<Route path="*" element={<Navigate to="/auth" />} />
						</>
					)}
				</Route>
			</Routes>
		</BrowserRouter>
	);
};

export { AppRoutes };
