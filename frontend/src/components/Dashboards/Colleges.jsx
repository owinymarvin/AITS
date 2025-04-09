import { useState, useEffect } from "react";
import { Modal, Button, Form, Table } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { getColleges, createCollege } from "../../services/api"; // Import createCollege

const Colleges = () => {
  const [colleges, setColleges] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const data = await getColleges();
        setColleges(data);
      } catch (err) {
        setError("Failed to load colleges", err);
      }
    };
    fetchColleges();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Use the createCollege function from your API service
      const newCollege = await createCollege(formData);

      // Update local state with the new college
      setColleges((prev) => [...prev, newCollege]);

      // Close modal and reset form
      setIsModalOpen(false);
      setFormData({ name: "", code: "", description: "" });
      setError(null);
    } catch (error) {
      console.error("Error adding college:", error);
      setError(error.message || "Failed to create college");
    }
  };

  return (
    <div>
      {/* Error message display */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="dashboard-grid">
        {/* Update card values to use dynamic data */}
        <div className="card">
          <h2 className="card-title">Total Colleges</h2>
          <p className="card-value">{colleges.length}</p>
        </div>
        <div className="card">
          <h2 className="card-title">Total Lecturers</h2>
          <p className="card-value">96</p>
        </div>
        <div className="card">
          <h2 className="card-title">Total Students</h2>
          <p className="card-value">2,892</p>
        </div>
      </div>

      <div className="card">
        <div className="card_header d-flex justify-content-between align-items-center mb-3">
          <h2 className="card-title mb-0">Colleges</h2>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            Add College
          </Button>
        </div>

        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Code</th>
              <th>College Name</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {colleges.map((college) => (
              <tr key={college.id}>
                <td>{college.code}</td>
                <td>{college.name}</td>
                <td>{college.description || "-"}</td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* Add College Modal */}
        <Modal
          show={isModalOpen}
          onHide={() => {
            setIsModalOpen(false);
            setError(null);
          }}
          backdrop="static"
        >
          <Modal.Header closeButton>
            <Modal.Title>Add New College</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formName">
                <Form.Label>College Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter college name"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formCode">
                <Form.Label>College Code</Form.Label>
                <Form.Control
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter college code (e.g., COE000)"
                  maxLength="10"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formDescription">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Optional description"
                />
              </Form.Group>

              <div className="d-grid gap-2">
                <Button variant="success" type="submit">
                  Create College
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default Colleges; 