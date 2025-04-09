import { useState, useEffect } from "react";
import { Modal, Button, Form, Table } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { getCourses, getDepartments, createCourse } from "../../services/api";

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
        <div className="card">
          <h2 className="card-title">Total Courses</h2>
          <p className="card-value">{courses.length}</p>
        </div>
        <div className="card">
          <h2 className="card-title">Total Departments</h2>
          <p className="card-value">{departments.length}</p>
        </div>
        <div className="card">
          <h2 className="card-title">Active Students</h2>
          <p className="card-value">892</p>
        </div>
      </div>

      <div className="card">
        <div className="card_header d-flex justify-content-between align-items-center mb-3">
          <h2 className="card-title mb-0">Courses</h2>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            Add Course
          </Button>
        </div>

        {error && (
          <div className="alert alert-danger mb-3" role="alert">
            {error}
          </div>
        )}

        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Code</th>
              <th>Course Name</th>
              <th>Department</th>
              <th>Description</th>
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
            <Modal.Title>Add New Course</Modal.Title>
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

              <div className="d-grid gap-2">
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