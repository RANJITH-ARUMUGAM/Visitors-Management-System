import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

const AppointmentForm = (setTitle) => {


  useEffect(() => {
    setTitle("Book Appointment");
  }, []);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm();

  const saveData = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleNext = (data) => {
    saveData(data);
    setStep(step + 1);
  };

  const handlePrev = () => {
    setStep(step - 1);
  };

  const handleStepClick = (stepNumber) => {
    setStep(stepNumber);
  };

  const onSubmit = (data) => {
    saveData(data);
    console.log("Final Form Data:", { ...formData, ...data });
  };

  const ProgressBar = () => (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "20px" }}>
      {[1, 2, 3].map((s, index) => (
        <React.Fragment key={s}>
          {index > 0 && <div style={{ width: "100px", height: "4px", backgroundColor: step >= s ? "#4CAF50" : "#ddd", zIndex: 1 }}></div>}
          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              backgroundColor: step >= s ? "#4CAF50" : "#ddd",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
              zIndex: 2,
            }}
            onClick={() => handleStepClick(s)}
          >
            {s}
          </div>
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#A9CFEF", padding: "20px" }}>
      <form onSubmit={handleSubmit(onSubmit)} style={{ backgroundColor: "#f0f8ff", padding: "20px", borderRadius: "8px", boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)", maxWidth: "600px", width: "100%", margin: "auto" }}>
        <h3 style={{ textAlign: "center", marginBottom: "20px" }}>Book an Appointment</h3>
        <ProgressBar />

        {step === 1 && (
          <>
            <label>Username</label>
            <input type="text" {...register("username", { required: "Username is required" })} defaultValue={formData.username || ""} style={{ width: "100%", padding: "8px", marginBottom: "20px", border: "1px solid #ccc", borderRadius: "4px" }} maxLength={25} />
            {errors.username && <p style={{ color: "red" }}>{errors.username.message}</p>}

            <label>Mobile Number</label>
            <input
              type="text"
              {...register("mobile", {
                required: "Mobile is required",
                pattern: { value: /^[1-9][0-9]{9}$/, message: "Enter a valid 10-digit number without leading 0" }
              })}
              defaultValue={formData.mobile || ""}
              style={{ width: "100%", padding: "8px", marginBottom: "20px", border: "1px solid #ccc", borderRadius: "4px" }}
              maxLength={10}
              onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')}
            />
            {errors.mobile && <p style={{ color: "red" }}>{errors.mobile.message}</p>}

            <button type="button" onClick={handleSubmit(handleNext)} style={{ width: "48%", padding: "10px", backgroundColor: "#4CAF50", color: "white", borderRadius: "4px", cursor: "pointer" }}>Save & Continue</button>
          </>
        )}

        {step === 2 && (
          <>
            <label>Purpose</label>
            <input type="text" {...register("purpose", { required: "Purpose is required" })} defaultValue={formData.purpose || ""} style={{ width: "100%", padding: "8px", marginBottom: "20px", border: "1px solid #ccc", borderRadius: "4px" }} />
            {errors.purpose && <p style={{ color: "red" }}>{errors.purpose.message}</p>}

            <label>ID Proof</label>
            <input type="file" {...register("idProof", { required: "ID Proof is required" })} style={{ width: "100%", padding: "8px", marginBottom: "20px", border: "1px solid #ccc", borderRadius: "4px" }} />
            {errors.idProof && <p style={{ color: "red" }}>{errors.idProof.message}</p>}

            <button type="button" onClick={handlePrev} style={{ width: "48%", padding: "10px", backgroundColor: "#ccc", color: "black", borderRadius: "4px", cursor: "pointer", marginBottom: "10px" }}>Back</button>
            <button type="button" onClick={handleSubmit(handleNext)} style={{ width: "48%", padding: "10px", backgroundColor: "#4CAF50", color: "white", borderRadius: "4px", cursor: "pointer" }}>Save & Continue</button>
          </>
        )}

        {step === 3 && (
          <>
            <label>Date of Appointment</label>
            <input type="date" {...register("date", { required: "Date is required" })} defaultValue={formData.date || ""} style={{ width: "100%", padding: "8px", marginBottom: "20px", border: "1px solid #ccc", borderRadius: "4px" }} />
            {errors.date && <p style={{ color: "red" }}>{errors.date.message}</p>}

            <label>Number of Persons Accompanying</label>
            <input type="number" {...register("persons", { required: "Number of persons is required" })} style={{ width: "100%", padding: "8px", marginBottom: "20px", border: "1px solid #ccc", borderRadius: "4px" }} />
            {errors.persons && <p style={{ color: "red" }}>{errors.persons.message}</p>}

            <label>Availing Car Parking</label>
            <select {...register("carParking")} style={{ width: "100%", padding: "8px", marginBottom: "20px", border: "1px solid #ccc", borderRadius: "4px" }}>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>

            <button type="button" onClick={handlePrev} style={{ width: "48%", padding: "10px", backgroundColor: "#ccc", color: "black", borderRadius: "4px", cursor: "pointer", marginBottom: "10px" }}>Back</button>
            <button type="submit" style={{ width: "48%", padding: "10px", backgroundColor: "#008CBA", color: "white", borderRadius: "4px", cursor: "pointer" }}>Submit</button>
          </>
        )}
      </form>
    </div>
  );
};

export default AppointmentForm;
