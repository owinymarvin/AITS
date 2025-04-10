import { useState, useEffect } from "react";
import { Modal, Button, Form, Table } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { getCourses, getDepartments, createCourse } from "../../services/api";
import { FaBook, FaBuilding, FaUserGraduate, FaPlus, FaCode, FaInfoCircle } from "react-icons/fa";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    course_name: "",
    course_code: "",
    details: "",
    department: ""
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesData, departmentsData] = await Promise.all([
          getCourses(),
          getDepartments()
        ]);
        setCourses(coursesData);
        setDepartments(departmentsData);
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
    if (!formData.course_name || !formData.course_code || !formData.department) {
      setError("Please fill all required fields");
      return;
    }

    try {
      const newCourse = await createCourse(formData);
      
      // Update the local state with the new course
      setCourses((prev) => [...prev, newCourse]);
      
      // Reset form and show success
      setFormData({
        course_name: "",
        course_code: "",
        details: "",
        department: ""
      });
      setSuccess("Course created successfully!");
      
      // Close modal after a short delay to show the success message
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess(null);
      }, 1500);
    } catch (err) {
      console.error("Failed to create course", err);
      setError(err.response?.data?.detail || "Failed to create course. Please try again.");
    }
  };

  return (
    <div>
      <div className="dashboard-grid">
        <div className="card dashboard-card">
          <div className="card-body">
            <div className="d-flex align-items-center">
              <div className="icon-box bg-info">
                <FaBook />
              </div>
              <div className="ms-3">
                <h6 className="card-subtitle text-muted">Total Courses</h6>
                <h4 className="card-title mb-0">{courses.length}</h4>
              </div>
            </div>
          </div>
        </div>
        
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
                <FaUserGraduate />
              </div>
              <div className="ms-3">
                <h6 className="card-subtitle text-muted">Active Students</h6>
                <h4 className="card-title mb-0">892</h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0"><FaBook className="me-2" />Courses</h5>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            <FaPlus className="me-1" /> Add Course
          </Button>
        </div>

        {error && (
          <div className="alert alert-danger mx-3 mt-3" role="alert">
            {error}
          </div>
        )}

        <div className="card-body p-0">
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th><FaCode className="me-1" /> Code</th>
                <th><FaBook className="me-1" /> Course Name</th>
                <th><FaBuilding className="me-1" /> Department</th>
                <th><FaInfoCircle className="me-1" /> Description</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id}>
                  <td>{course.course_code}</td>
                  <td>{course.course_name}</td>
                  <td>{course.department_name || "N/A"}</td>
                  <td>{course.details || "-"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {/* Add Course Modal */}
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
            <Modal.Title><FaBook className="me-2" />Add New Course</Modal.Title>
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
              <Form.Group className="mb-3" controlId="formCourseName">
                <Form.Label>Course Name</Form.Label>
                <Form.Control
                  type="text"
                  name="course_name"
                  value={formData.course_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter course name"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formCourseCode">
                <Form.Label>Course Code</Form.Label>
                <Form.Control
                  type="text"
                  name="course_code"
                  value={formData.course_code}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter course code (e.g., CS101)"
                  maxLength="10"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formDepartment">
                <Form.Label>Department</Form.Label>
                <Form.Select 
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.department_name} ({dept.department_code})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formDetails">
                <Form.Label>Details</Form.Label>
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
                  Create Course
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default Courses; 