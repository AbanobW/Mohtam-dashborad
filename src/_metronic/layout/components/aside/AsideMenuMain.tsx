/* eslint-disable @typescript-eslint/no-unused-vars */
import { useIntl } from "react-intl";
import { AsideMenuItem } from "./AsideMenuItem";
import fire from "../../../../../public/media/icons/sho3la.svg"
import camps from "../../../../../public/media/icons/camps.svg"

export function AsideMenuMain() {
  const intl = useIntl();
  return (
    <>
      <AsideMenuItem
        to="/dashboard"
        title="Home"
        fontIcon="bi-house fs-2"
        bsTitle={intl.formatMessage({ id: "MENU.DASHBOARD" })}
        className="py-2"
      />

      <AsideMenuItem
        to="/users"
        title="Users"
        fontIcon="bi-person-fill fs-1"
        bsTitle="USERS"
        className="py-2"
      />

      <AsideMenuItem
        to="/tags"
        title="Tags"
        fontIcon="bi-tags-fill fs-1"
        bsTitle="TAGS"
        className="py-2"
      />

      <AsideMenuItem
        to="/subjects"
        title="Subjects"
        // fontIcon="bi-kanban-fill fs-1"
        bsTitle="SUBJECTS"
        className="py-2"
        imgIcon={camps} // Path to your SVG icon

      />

      <AsideMenuItem
        to="/articles"
        title="Articles"
        // fontIcon="bi-newspaper fs-1"
        bsTitle="ARTICLES"
        className="py-2"
        imgIcon={fire} // Path to your SVG icon
      />
    </>
  );
}
