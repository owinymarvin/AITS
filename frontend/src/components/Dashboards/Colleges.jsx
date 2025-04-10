import { useState, useEffect } from "react";
import { Modal, Button, Form, Table } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { getColleges, createCollege, getUsers } from "../../services/api"; // Added getUsers
import { FaUniversity, FaChalkboardTeacher, FaUserGraduate, FaPlus, FaBuilding, FaInfoCircle, FaGraduationCap } from "react-icons/fa";

const Colleges = () => {
  const [colleges, setColleges] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [lecturerCount, setLecturerCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch colleges and users in parallel
        const [collegesData, usersData] = await Promise.all([
          getColleges(),
          getUsers()
        ]);
        
        setColleges(collegesData);
        
        // Count lecturers and students from the user data
        const lecturers = usersData.filter(user => user.role === 'LECTURER').length;
        const students = usersData.filter(user => user.role === 'STUDENT').length;
        
        setLecturerCount(lecturers);
        setStudentCount(students);
        setError(null);
      } catch (err) {
        console.error("Failed to load data:", err);
        setError("Failed to load colleges and user statistics");
      } finally {
        setLoading(false);
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
    if (!formData.name || !formData.code) {
      setError("Please fill all required fields");
      return;
    }
    
    try {
      // Use the createCollege function from your API service
      const newCollege = await createCollege(formData);

      // Update local state with the new college
      setColleges((prev) => [...prev, newCollege]);

      // Reset form and show success
      setFormData({ name: "", code: "", description: "" });
      setSuccess("College created successfully!");
      
      // Close modal after a short delay to show the success message
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess(null);
      }, 1500);
    } catch (error) {
      console.error("Error adding college:", error);
      setError(error.message || "Failed to create college");
    }
  };

  return (
    <div>
      {/* Error message display */}
      {error && (
        <div className="alert alert-danger mx-3 mt-3" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading college data...</p>
        </div>
      ) : (
        <>
          <div className="dashboard-grid">
            <div className="card dashboard-card">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="icon-box bg-primary">
                    <FaUniversity />
                  </div>
                  <div className="ms-3">
                    <h6 className="card-subtitle text-muted">Total Colleges</h6>
                    <h4 className="card-title mb-0">{colleges.length}</h4>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card dashboard-card">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="icon-box bg-info">
                    <FaChalkboardTeacher />
                  </div>
                  <div className="ms-3">
                    <h6 className="card-subtitle text-muted">Total Lecturers</h6>
                    <h4 className="card-title mb-0">{lecturerCount}</h4>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card dashboard-card">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="icon-box bg-success">
                    <FaUserGraduate />
                  </div>
                  <div className="ms-3">
                    <h6 className="card-subtitle text-muted">Total Students</h6>
                    <h4 className="card-title mb-0">{studentCount}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0"><FaUniversity className="me-2" />Colleges</h5>
              <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                <FaPlus className="me-1" /> Add College
              </Button>
            </div>

            <div className="card-body p-0">
              {colleges.length === 0 ? (
                <div className="text-center py-4">
                  <p className="mb-0">No colleges found. Add your first college using the button above.</p>
                </div>
              ) : (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th><FaGraduationCap className="me-1" /> Code</th>
                      <th><FaUniversity className="me-1" /> College Name</th>
                      <th><FaInfoCircle className="me-1" /> Description</th>
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
              )}
            </div>
          </div>
        </>
      )}

      {/* Add College Modal */}
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
          <Modal.Title><FaUniversity className="me-2" />Add New College</Modal.Title>
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

            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="success" type="submit">
                Create College
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Colleges; 