import { useState, useEffect } from "react";
import { Table } from "react-bootstrap";
import { useParams } from "react-router-dom";
import {
  Modal,
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
} from "@mui/material";
import {
  getIssues,
  getCourses,
  createIssue,
  getCurrentUser,
} from "../../services/api";

const StudentsIssues = () => {
  const [showModal, setShowModal] = useState(false);
  const [issues, setIssues] = useState([]);
  const [courses, setCourses] = useState([]);
  const { course_code } = useParams();
  const [studentDepartment, setStudentDepartment] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    status: "Pending",
    course_code: course_code,
    issue_type: "",
    description: "",
  });

  useEffect(() => {
    // if (showModal) {
    const fetchData = async () => {
      try {
        // Fetch both data types in parallel
        const [issuesData, coursesData, studentData] = await Promise.all([
          getIssues(),
          getCourses(),
          getCurrentUser(),
        ]);

        setIssues(issuesData);
        setCourses(coursesData);
        setStudentDepartment(studentData.department);
        console.log("Fetched issues:", issuesData);
        console.log("Fetched courses:", coursesData);
        console.log("Fetched student data:", studentData);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Handle error appropriately - maybe set an error state
      }
    };

    fetchData();
    // }
  }, []);

  const filteredCourses = courses.filter(
    (course) => !studentDepartment || course.college_id === studentDepartment.id
  );

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const NewIssue = createIssue(formData);
      console.log("New issue created:", NewIssue);
    } catch (error) {
      console.error("Error creating issue:", error);
    }
    // Reset the form after submission
    setFormData({
      title: "",
      status: "Pending",
      course_code: "",
      issue_type: "",
      description: "",
    });
    handleClose();
  };

  return (
    <div className="card p-4">
      <h2 className="card-title">Issues Management</h2>
      <Button
        variant="contained"
        color="primary"
        onClick={handleShow}
        className="mb-3"
        style={{ width: "200px", marginLeft: "auto", display: "block" }}
      >
        Add New Issue
      </Button>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Title</th>
            <th>Course Code</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {issues
            .filter((issue) => issue.status !== "Solved")
            .map((issue) => (
              <tr key={issue.id} value={issue.id}>
                <td>{issue.title}</td>
                <td>{issue.course_code}</td>
                <td>
                  <span
                    className={`badge bg-${
                      issue.status === "Pending" ? "warning" : "info"
                    }`}
                  >
                    {issue.status}
                  </span>
                </td>
              </tr>
            ))}
        </tbody>
      </Table>

      {/* MUI Modal for Adding New Issue */}
      <Modal
        open={showModal}
        onClose={handleClose}
        backdrop="static"
        className="custom-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "white",
            p: 4,
            borderRadius: 2,
            boxShadow: 24,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Log New Issue
          </Typography>

          {/* Issue Title */}
          <TextField
            label="Issue Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            required
          />

          {/* Course Dropdown */}
          <TextField
            select
            label="Course"
            name="course"
            value={formData.course || ""}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            required
          >
            <MenuItem value="">Select a course</MenuItem>
            {filteredCourses.map((course) => (
              <MenuItem key={course.id} value={course.id}>
                {course.course_code} - {course.course_name}
              </MenuItem>
            ))}
          </TextField>

          {/* Issue Type Dropdown */}
          <TextField
            select
            label="Issue Type"
            name="issue_type"
            value={formData.issue_type}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            required
          >
            <MenuItem value="">Select Issue Type</MenuItem>
            <MenuItem value="Missing Marks">Missing Marks</MenuItem>
            <MenuItem value="Appeals">Appeals</MenuItem>
            <MenuItem value="Corrections">Corrections</MenuItem>
          </TextField>

          {/* Issue Description */}
          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={3}
            fullWidth
            margin="normal"
            variant="outlined"
            required
          />

          {/* Submit Button */}
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            fullWidth
          >
            Submit
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default StudentsIssues;
