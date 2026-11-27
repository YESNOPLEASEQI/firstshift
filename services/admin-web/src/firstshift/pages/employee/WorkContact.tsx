import { Link, Navigate, useParams } from "react-router-dom";
import { useDocumentTitle } from "../../components/ui";
import { demoContacts } from "../../fixtures/demo";

export default function WorkContact() {
  useDocumentTitle("工作联系人");
  const { contactId } = useParams();
  const contact = demoContacts.find((entry) => entry.id === contactId);

  if (!contact) {
    return <Navigate to="/firstshift/work/contacts" replace />;
  }

  return (
    <div className="v3-card">
      <h2 className="fs-h2" style={{ margin: 0 }}>
        {contact.role}
      </h2>
      <p className="fs-body" style={{ marginTop: 14 }}>
        {contact.description}
      </p>
      <p className="v3-contact-note">暂无已提供的联系方式。</p>
      <p className="v3-demo-note" style={{ marginTop: 4 }}>
        {contact.note}。
      </p>
      <div className="v3-actions-stack">
        <Link className="fs-btn fs-btn--primary" to="/firstshift/help/request">
          提出求助
        </Link>
      </div>
    </div>
  );
}
