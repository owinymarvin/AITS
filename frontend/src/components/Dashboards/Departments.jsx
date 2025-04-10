import { useEffect, useState } from "react";
import { getDepartments, createDepartment, getColleges } from "../../services/api";
import { Table, Button, Modal, Form } from "react-bootstrap";
import { FaBuilding, FaUniversity, FaBook, FaPlus, FaCode, FaInfoCircle, FaEdit, FaTrash } from "react-icons/fa";

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    department_name: "",
    department_code: "",
    details: "",
    college_id: ""
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptData, collegeData] = await Promise.all([
          getDepartments(),
          getColleges()
        ]);
        setDepartments(deptData);
        setColleges(collegeData);
      } catch (err) {
        console.error("Failed to load data", err);
        setError("Failed to load data. Please try again.");
      }
    };
    fetchData();
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
    setError(null);
    setSuccess(null);

    // Validate form
    if (!formData.department_name || !formData.department_code || !formData.college_id) {
      setError("Please fill all required fields");
      return;
    }

    try {
      const newDepartment = await createDepartment(formData);
      
      // Update the local state with the new department
      setDepartments((prev) => [...prev, newDepartment]);
      
      // Reset form and close modal
      setFormData({
        department_name: "",
        department_code: "",
        details: "",
        college_id: ""
      });
      setSuccess("Department created successfully!");
      
      // Close modal after a short delay to show the success message
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess(null);
      }, 1500);
    } catch (err) {
      console.error("Failed to create department", err);
      setError(err.response?.data?.detail || "Failed to create department. Please try again.");
    }
  };

  return (
    <div>
      <div className="dashboard-grid">
        <div className="card dashboard-card">
          <div className="card-body">
            <div className="d-flex align-items-center">
              <div className="icon-box bg-primary">
                <FaBuilding />
              </div>
              <div className="ms-3">
                <h6 className="card-subtitle text-muted">Total Departments</h6>
                <h4 className="card-title mb-0">{departments.length}</h4>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card dashboard-card">
          <div className="card-body">
            <div className="d-flex align-items-center">
              <div className="icon-box bg-success">
                <FaBook />
              </div>
              <div className="ms-3">
                <h6 className="card-subtitle text-muted">Department Courses</h6>
                <h4 className="card-title mb-0">15</h4>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card dashboard-card">
          <div className="card-body">
            <div className="d-flex align-items-center">
              <div className="icon-box bg-info">
                <FaUniversity />
              </div>
              <div className="ms-3">
                <h6 className="card-subtitle text-muted">Total Colleges</h6>
                <h4 className="card-title mb-0">{colleges.length}</h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0"><FaBuilding className="me-2" /> Departments</h5>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            <FaPlus className="me-1" /> Add Department
          </Button>
        </div>

        {error && (
          <div className="alert alert-danger mt-3 mx-3 mb-0" role="alert">
            {error}
          </div>
        )}

        <div className="card-body p-0">
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead className="bg-light">
                <tr>
                  <th><FaCode className="me-2" /> Department Code</th>
                  <th><FaBuilding className="me-2" /> Department Name</th>
                  <th><FaInfoCircle className="me-2" /> Details</th>
                  <th><FaUniversity className="me-2" /> College</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((department) => (
                  <tr key={department.id}>
                    <td>{department.department_code}</td>
                    <td>{department.department_name}</td>
                    <td>{department.details || "N/A"}</td>
                    <td>{department.college_name}</td>
                    <td>
                      <Button variant="info" size="sm" className="me-1">
                        <FaEdit /> Edit
                      </Button>
                      <Button variant="danger" size="sm">
                        <FaTrash /> Delete
                      </Button>
                    </td>
                  </tr>
                ))}
                {departments.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-3">No departments found</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </div>

        {/* Add Department Modal */}
        <Modal
          show={isModalOpen}
          onHide={() => {
            setIsModalOpen(false);
            setError(null);
            setSuccess(null);
          }}
          backdrop="static"
        >
          <Modal.Header closeButton>
            <Modal.Title><FaBuilding className="me-2" /> Add New Department</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            {success && (
              <div className="alert alert-success" role="alert">
                {success}
              </div>
            )}
            
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formDepartmentName">
                <Form.Label><FaBuilding className="me-1" /> Department Name</Form.Label>
                <Form.Control
                  type="text"
                  name="department_name"
                  value={formData.department_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter department name"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formDepartmentCode">
                <Form.Label><FaCode className="me-1" /> Department Code</Form.Label>
                <Form.Control
                  type="text"
                  name="department_code"
                  value={formData.department_code}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter department code (e.g., DCS)"
                  maxLength="10"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formCollege">
                <Form.Label><FaUniversity className="me-1" /> College</Form.Label>
                <Form.Select 
                  name="college_id"
                  value={formData.college_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a college</option>
                  {colleges.map(college => (
                    <option key={college.id} value={college.id}>
                      {college.name} ({college.code})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formDetails">
                <Form.Label><FaInfoCircle className="me-1" /> Details</Form.Label>
                <Form.Control
                  as="textarea"
                  name="details"
                  value={formData.details}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Optional description"
                />
              </Form.Group>

              <div className="d-flex justify-content-end">
                <Button variant="secondary" className="me-2" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="success" type="submit">
                  <FaPlus className="me-1" /> Create Department
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
