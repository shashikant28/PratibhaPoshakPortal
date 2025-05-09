import { useEffect, useState, useRef } from "react";
import axios from "axios";
import {UserCircle, Phone, Home, GraduationCap, Calculator,} from "lucide-react";
import classes from "./NewApplication.module.css";
const NewApplication = () => {
  const currentYear = new Date().getFullYear();
  const startYear = 2022;
  const yearOptions = Array.from({ length: currentYear - startYear + 1 },(_, i) => startYear + i);
  const submitButtonRef = useRef(null);

  const initialFormData = {
    nmms_year: "",
    nmms_reg_number: "",
    student_name: "",
    gender: "",
    DOB: "",
    aadhaar: "",
    father_name: "",
    mother_name: "",
    family_income_total: "",
    home_address: "",
    contact_no1: "",
    contact_no2: "",
    app_state: "",
    district: "",
    nmms_block: "",
    current_institute_dise_code: "",
    previous_institute_dise_code: "",
    medium: "",
    gmat_score: "",
    sat_score: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [institutes, setInstitutes] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/states");
        setStates(response.data);
      } catch (error) {
        console.error("Error fetching states:", error);
      }
    };
    fetchStates();
  }, []);

  useEffect(() => {
    if (!formData.app_state) return;
    const fetchDistricts = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/districts-by-state/${formData.app_state}`);
        setDistricts(response.data);
      } catch (error) {
        console.error("Error fetching districts:", error);
      }
    };
    fetchDistricts();
  }, [formData.app_state]);

  useEffect(() => {
    if (!formData.district) return;
    const fetchBlocks = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/blocks-by-district/${formData.district}`);
        setBlocks(response.data);
      } catch (error) {
        console.error("Error fetching blocks:", error);
      }
    };
    fetchBlocks();
  }, [formData.district]);

  useEffect(() => {
    if (!formData.nmms_block) return;
    const fetchInstitutes = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/institutes-by-block/${formData.nmms_block}`);
        setInstitutes(response.data);
      } catch (error) {
        console.error("Error fetching institutes:", error);
      }
    };
    fetchInstitutes();
  }, [formData.nmms_block]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    let newValue = value;
    if (["student_name", "father_name", "mother_name", "home_address"].includes(name)) {
      newValue = value.toUpperCase();
    }

    // Allow only numbers for specific fields
    if (["aadhaar", "contact_no1", "contact_no2", "gmat_score", "sat_score", "family_income_total"].includes(name)) {
      if (!/^\d*$/.test(value)) return; // Prevent non-numeric characters
    }

    // Restrict GMAT and SAT scores to 2-digit numbers (0-90)
    if (["gmat_score", "sat_score"].includes(name)) {
      if (!/^(?:[0-9]|[1-8][0-9]|90)?$/.test(value)) return;
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const namePattern = /^[a-zA-Z\s]+$/;
    const aadhaarPattern = /^\d{12}$/;
    const incomePattern = /^\d+$/;
    const phonePattern = /^\d{10}$/;
    const scorePattern = /^(?:[0-8]?\d|90)$/; //0 to 90 max

    let validationErrors = {};

    //validating the form
    //validating the nmms year
    if (!formData.nmms_year) {
      validationErrors.nmms_year = "Please select a NMMS Year.";
    }
    //Validating the names
    if (!formData.student_name.match(namePattern)) {
      alert("The student name should contain only letters and spaces");
      return;
    }
    if (!formData.father_name.match(namePattern)) {
      alert("Father name should contain only letters and spaces.");
      return;
    }
    if (formData.mother_name && !formData.mother_name.match(namePattern)) {
      alert("Mother name should contain only letters and spaces.");
      return;
    }

    //Validate the Aadhar
    if (formData.aadhaar && !formData.aadhaar.match(aadhaarPattern)) {
      alert("Aadhaar number must be exactly 12 digits.");
      return;
    }

    //validate the family income
    if (
      formData.family_income_total &&
      !formData.family_income_total.match(incomePattern)
    ) {
      alert("Family income must be a valid number.");
      return;
    }

    //validate Date of birth
    const today = new Date().toISOString().split("T")[0];
    if (formData.DOB && new Date(formData.DOB) > new Date(today)) {
      alert("Date of birth cannot be in the future");
      return;
    }

    //validate contact numbers
    if (!formData.contact_no1.match(phonePattern)) {
      alert("Primary contact number should be exactly 10 digits");
      return;
    }
    if (formData.contact_no2 && !formData.contact_no2.match(phonePattern)) {
      alert("Secondary contact number should be exactly 10 digits");
      return;
    }

    //Validate scores
    if (!formData.sat_score.match(scorePattern)) {
      alert("The SAT score must be a number between 0 to 90");
      return;
    }
    if (!formData.gmat_score.match(scorePattern)) {
      alert("The GMAT score must be a number between 0 to 90");
      return;
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/applicants/create",formData);
      if (response.status === 201) {
        animateSubmitButton();
        alert("Application submitted successfully!");
        setFormData(initialFormData);
        setErrors({});
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Failed to submit application.");
    }
  };

  const animateSubmitButton = () => {
    const button = submitButtonRef.current;
    if (!button) return;
  
    button.classList.add("state-1", "animated");
  
    setTimeout(() => {
      button.classList.add("state-2");
  
      setTimeout(() => {
        button.classList.remove("state-1", "state-2", "animated");
      }, 2000);
    }, 2000);
  };
  

  return (
    <div className={classes.container}>
      <h2 className={classes.h2}>New Application</h2>
      {Object.keys(errors).length > 0 && (
        <div className={classes.errorContainer}>
          {Object.values(errors).map((error, index) => (<p key={index}>{error}</p>))}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className={classes.formSection}>
          <h3 className={classes.sectionTitle}><UserCircle className={classes.sectionIcon} />Basic Information</h3>
          <div className={classes.fieldGroup}>
            <div className={classes.formField}>
              <label className={classes.label}> NMMS YEAR : <span className={classes.required}></span></label>
              <select
                name="nmms_year"
                value={formData.nmms_year}
                onChange={(e) => {
                  handleChange(e);
                  e.target.setCustomValidity(""); // reset custom message
                }}
                onInvalid={(e) => {
                  e.target.setCustomValidity("Please select the NMMS Year");
                }}
                required
              >
                <option value="">Select Year</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div className={classes.formField}>
              <label className="required">NMMS Reg Number: <span className={classes.required}></span></label>
              <input
                type="text"
                name="nmms_reg_number"
                value={formData.nmms_reg_number}
                onChange={handleChange}
                maxLength="11"
                inputMode="numeric"
                required
                onInvalid={(e) => e.target.setCustomValidity("NMMS Reg Number must be exactly 11 digits!")}
                onInput={(e) => e.target.setCustomValidity("")}
              />
            </div>
          </div>
          <div className={classes.fieldGroup}>
            <div className={classes.formField}>
              <label>Student Name: <span className={classes.required}></span></label>
              <input
                type="text"
                name="student_name"
                value={formData.student_name}
                onChange={handleChange}
                required
              />
              {errors.student_name && (<p style={{ color: "red" }}>{errors.student_name}</p>)}
            </div>
            <div className={classes.formField}>
              <label className="required">Gender : <span className={classes.required}></span></label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select gender</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
            </div>
          </div>

          <div className={classes.fieldGroup}>
            <div className={classes.formField}>
              <label>Date of Birth:</label>
              <input
                type="date"
                name="DOB"
                value={formData.DOB}
                onChange={handleChange}
              />
              {errors.DOB && <p style={{ color: "red" }}>{errors.DOB}</p>}
            </div>
            <div className={classes.formField}>
              <label>Aadhaar: <span className={classes.required}></span></label>
              <input
                type="text"
                name="aadhaar"
                value={formData.aadhaar}
                onChange={handleChange}
                maxLength="12"
              />
            </div>
          </div>
        </div>

        <div className={classes.sectionDivider} />
        <div className={classes.formSection}>
          <h3 className={classes.sectionTitle}><Home className={classes.sectionIcon} />Family Information</h3>
          <div className={classes.fieldGroup}>
            <div className={classes.formField}>
              <label className="required">Father Name: <span className={classes.required}></span></label>
              <input
                type="text"
                name="father_name"
                value={formData.father_name}
                onChange={handleChange}
                required
              />
              {errors.father_name && (<p style={{ color: "red" }}>{errors.father_name}</p>)}
            </div>
            <div className={classes.formField}>
              <label>Mother Name:</label>
              <input
                type="text"
                name="mother_name"
                value={formData.mother_name}
                onChange={handleChange}
              />
              {errors.mother_name && (<p style={{ color: "red" }}>{errors.mother_name}</p>)}
            </div>
          </div>
          <div className={classes.fieldGroup}>
            <div className={classes.formField}>
              <label>Family Income (monthly):</label>
              <input
                type="text"
                name="family_income_total"
                value={formData.family_income_total}
                onChange={handleChange}
                maxLength="7"
                placeholder="Monthly income in rupees"
              />
            </div>
            <div className={classes.formField}>
              <label>Home Address:</label>
              <input
                type="text"
                name="home_address"
                value={formData.home_address}
                onChange={handleChange}
                placeholder="Complete residential address"
              />
            </div>
          </div>
        </div>
        <div className={classes.sectionDivider} />
        <div className={classes.formSection}>
          <h3 className={classes.sectionTitle}><Phone className={classes.sectionIcon} />Contact Information</h3>
          <div className={classes.fieldGroup}>
            <div className={classes.formField}>
              <label className="required">Contact No 1: <span className={classes.required}></span></label>
              <input
                type="text"
                name="contact_no1"
                value={formData.contact_no1}
                onChange={handleChange}
                required
                maxLength="10"
                placeholder="10-digit mobile numbers"
              />
            </div>
            <div className={classes.formField}>
              <label>Contact No 2: <span className={classes.required}></span></label>
              <input
                type="text"
                name="contact_no2"
                value={formData.contact_no2}
                onChange={handleChange}
                required
                maxLength="10"
                placeholder="Alternative contact number"
              />
            </div>
          </div>
        </div>
        <div className={classes.sectionDivider} />
        <div className={classes.formSection}>
          <h3 className={classes.sectionTitle}><GraduationCap className={classes.sectionIcon} />Eductaional Information</h3>
          <div className={classes.fieldGroup}>
            <div className={classes.formField}>
              <label className="required">State: <span className={classes.required}></span></label>
              <select
                name="app_state"
                value={formData.app_state}
                onChange={handleChange}
                required
              >
                <option value="">Select State</option>
                {states.map((state, index) => (
                  <option key={state.id || index} value={state.id}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={classes.formField}>
              <label className="required">EDUCATION DISTRICT: <span className={classes.required}></span></label>
              <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                required
              >
                <option value="">Select District</option>
                {districts.map((district, index) => (
                  <option key={district.id || index} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className={classes.fieldGroup}>
            <div className={classes.formField}>
              <label className="required">NMMS Block: <span className={classes.required}></span></label>
              <select
                name="nmms_block"
                onChange={handleChange}
                value={formData.nmms_block}
                required
              >
                <option value="">Select Block <span className={classes.required}></span></option>
                {blocks.map((block, index) => (
                  <option key={block.id || index} value={block.id}>
                    {block.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={classes.formField}>
              <label className="required">Medium:</label>
              <select
                type="text"
                name="medium"
                value={formData.medium}
                onChange={handleChange}
                required
              >
                <option value="">Select medium</option>
                <option value="KANNADA">KANNADA</option>
                <option value="ENGLISH">ENGLISH</option>
              </select>
            </div>
          </div>
          <div className={classes.fieldGroup}>
            <div className={classes.formField}>
              <label className="required">Current School Name: <span className={classes.required}></span></label>
              <select
                name="current_institute_dise_code"
                value={formData.current_institute_dise_code}
                onChange={handleChange}
                required
              >
                <option value="">Select School</option>
                {institutes.map((inst, index) => (
                  <option
                    key={inst.institute_id || index}
                    value={inst.dise_code}
                  >
                    {inst.institute_name} ({inst.dise_code})
                  </option>
                ))}
              </select>
            </div>
            <div className={classes.formField}>
              <label>Previous School Name:</label>
              <select
                type="text"
                name="previous_institute_dise_code"
                value={formData.previous_institute_dise_code}
                onChange={handleChange}
              >
                <option value="">Select School</option>
                {institutes.map((inst, index) => (
                  <option
                    key={inst.institute_id || index}
                    value={inst.dise_code}
                  >
                    {inst.institute_name} ({inst.dise_code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className={classes.sectionDivider} />
        <div className={classes.formSection}>
          <h3 className={classes.sectionTitle}><Calculator className={classes.sectionIcon} />Test Scores</h3>
          <div className={classes.fieldGroup}>
            <div className={classes.formField}>
              <label>GMAT Score: <span className={classes.required}></span></label>
              <input
                type="number"
                name="gmat_score"
                value={formData.gmat_score}
                onChange={handleChange}
                inputMode="numeric"
                maxLength="2"
                required
                min="0"
                max="90"
                placeholder="Score between 0-90"
              />
            </div>
            <div className={classes.formField}>
              <label>SAT Score: <span className={classes.required}></span></label>
              <input
                type="number"
                name="sat_score"
                value={formData.sat_score}
                onChange={handleChange}
                inputMode="numeric"
                maxLength="2"
                required
                min="0"
                max="90"
                placeholder="Score between 0-90"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          ref={submitButtonRef}
          className={`${classes.submitButton} submit-button`} // Ensure 'submit-button' class exists
        >
          Submit Application
        </button>


      </form>
    </div>
  );
};

export default NewApplication;