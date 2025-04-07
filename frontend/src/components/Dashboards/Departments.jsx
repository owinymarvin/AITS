import { useEffect, useState } from "react";
import { getDepartments } from "../../services/api";
import { Table, Button, Modal, Form } from "react-bootstrap";

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data = await getDepartments();
        setDepartments(data);
        console.log(data);
      } catch (err) {
        console.error("Failed to load departments", err);
      }
    };
    fetchDepartments();
  }, []);

  return (
    <div>
      <div className="dashboard-grid">
        <div className="card">
          <h2 className="card-title">Department Lecturers</h2>
          <p className="card-value">234</p>
        </div>
        <div className="card">
          <h2 className="card-title">Department Courses</h2>
          <p className="card-value">15</p>
        </div>
        <div className="card">
          <h2 className="card-title">Total Course Units</h2>
          <p className="card-value">892</p>
        </div>
      </div>
      <div className="card">
        <div className="card_header d-flex justify-content-between align-items-center mb-3">
          <h2 className="card-title mb-0">Departments</h2>
        </div>

        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Department Code</th>
              <th>Department Name</th>
              <th>Details</th>
              <th>Faculty</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((department) => (
              <tr key={department.id}>
                <td>{department.department_code}</td>
                <td>{department.department_name}</td>
                <td>{department.details || "N/A"}</td>
                <td>{department.faculty_name}</td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* Add Faculty Modal */}
        <Modal
          show={isModalOpen}
          onHide={() => {
            setIsModalOpen(false);
          }}
          backdrop="static"
        >
          <Modal.Header closeButton>
            <Modal.Title>Add New Faculty</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form>
              <Form.Group className="mb-3" controlId="formName">
                <Form.Label>Faculty Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  required
                  placeholder="Enter faculty name"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formCode">
                <Form.Label>Faculty Code</Form.Label>
                <Form.Control
                  type="text"
                  name="code"
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

export default Departments;
