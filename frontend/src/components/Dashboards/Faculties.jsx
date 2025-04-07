import { useState, useEffect } from "react";
import { Modal, Button, Form, Table } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { getFaculties, createFaculty } from "../../services/api"; // Import createFaculty

const Faculties = () => {
  const [faculties, setFaculties] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const data = await getFaculties();
        setFaculties(data);
      } catch (err) {
        setError("Failed to load faculties", err);
      }
    };
    fetchFaculties();
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
      // Use the createFaculty function from your API service
      const newFaculty = await createFaculty(formData);

      // Update local state with the new faculty
      setFaculties((prev) => [...prev, newFaculty]);

      // Close modal and reset form
      setIsModalOpen(false);
      setFormData({ name: "", code: "", description: "" });
      setError(null);
    } catch (error) {
      console.error("Error adding faculty:", error);
      setError(error.message || "Failed to create faculty");
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
          <h2 className="card-title">Total Faculties</h2>
          <p className="card-value">{faculties.length}</p>
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
          <h2 className="card-title mb-0">Faculties</h2>
          {/* <Button variant="dark" onClick={() => setIsModalOpen(true)}>
            Add Faculty
          </Button> */}
        </div>

        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Code</th>
              <th>Faculty Name</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {faculties.map((faculty) => (
              <tr key={faculty.id}>
                <td>{faculty.code}</td>
                <td>{faculty.name}</td>
                <td>{faculty.description || "-"}</td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* Add Faculty Modal */}
        <Modal
          show={isModalOpen}
          onHide={() => {
            setIsModalOpen(false);
            setError(null);
          }}
          backdrop="static"
        >
          <Modal.Header closeButton>
            <Modal.Title>Add New Faculty</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formName">
                <Form.Label>Faculty Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter faculty name"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formCode">
                <Form.Label>Faculty Code</Form.Label>
                <Form.Control
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter faculty code (e.g., FOE000)"
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
                  Create Faculty
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default Faculties;
