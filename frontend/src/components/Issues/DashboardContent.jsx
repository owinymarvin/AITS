import React, { useState } from "react";
import { Modal, Table, Button } from "react-bootstrap";
import { getIssues } from "../../services/api"; // Adjust import path as needed

const DashboardContent = () => {
  const [showModal, setShowModal] = useState(false);
  const [resolvedIssues, setResolvedIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Function to fetch resolved issues when modal opens
  const handleOpenResolvedIssues = async () => {
    setIsLoading(true);
    try {
      const allIssues = await getIssues();
      const resolved = allIssues.filter((issue) => issue.status === "Solved");
      setResolvedIssues(resolved);
    } catch (error) {
      console.error("Error fetching resolved issues:", error);
    } finally {
      setIsLoading(false);
      setShowModal(true);
    }
  };

  return (
    <div>
      <div className="dashboard-grid">
        <div className="card">
          <h2 className="card-title">Total Issues</h2>
          <p className="card-value">12</p>
        </div>
        <div
          className="card"
          onClick={handleOpenResolvedIssues}
          style={{ cursor: "pointer" }}
        >
          <h2 className="card-title">Resolved Issues</h2>
          <p className="card-value">05</p>
        </div>
        <div className="card">
          <h2 className="card-title">Pending Issues</h2>
          <p className="card-value">02</p>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Recent Activity</h2>
        <div>
          <div className="activity-item">
            <p className="activity-text">User John Doe placed an order</p>
            <p className="activity-time">2 hours ago</p>
          </div>
          <div className="activity-item">
            <p className="activity-text">
              New product added: Wireless Headphones
            </p>
            <p className="activity-time">5 hours ago</p>
          </div>
          <div className="activity-item">
            <p className="activity-text">
              User Jane Smith updated their profile
            </p>
            <p className="activity-time">Yesterday</p>
          </div>
        </div>
      </div>

      {/* Modal for Resolved Issues */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        backdrop="static"
        className="custom-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Resolved Issues</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isLoading ? (
            <p>Loading resolved issues...</p>
          ) : resolvedIssues.length > 0 ? (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Issue Type</th>
                  <th>Description</th>
                  <th>Resolved Date</th>
                </tr>
              </thead>
              <tbody>
                {resolvedIssues.map((issue) => (
                  <tr key={issue.id}>
                    <td>{issue.course_code}</td>
                    <td>{issue.issue_type}</td>
                    <td>{issue.description}</td>
                    <td>{new Date(issue.updated_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>No resolved issues found.</p>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default DashboardContent;
