import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const alertStyles = {
  container: {
    minWidth: "320px",
    minHeight: "320px",
    width: "340px",
    height: "340px",
    padding: "0",
    borderRadius: "50%",
    boxShadow: "0 8px 32px 0 rgba(31,38,135,0.18)",
    color: "#1e293b",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
    fontSize: "1.08rem",
    fontWeight: 500,
    letterSpacing: "0.01em",
    background: "linear-gradient(135deg, #f8fafc 60%, #e0e7ff 100%)",
    border: "2.5px solid #e0e7ff",
    overflow: "hidden",
    position: "relative",
  },
  success: {
    background: "linear-gradient(135deg, #e0f7ef 60%, #d1fae5 100%)",
    borderLeft: "8px solid #10b981"
  },
  error: {
    background: "linear-gradient(135deg, #ffeaea 60%, #fee2e2 100%)",
    borderLeft: "8px solid #ef4444"
  },
  warning: {
    background: "linear-gradient(135deg, #fff9e5 60%, #fef3c7 100%)",
    borderLeft: "8px solid #f59e0b"
  },
  info: {
    background: "linear-gradient(135deg, #e0f2ff 60%, #dbf4ff 100%)",
    borderLeft: "8px solid #3b82f6"
  },
  buttonContainer: {
    display: "flex",
    gap: "18px",
    marginTop: "22px",
    justifyContent: "center"
  },
  button: {
    padding: "12px 28px",
    border: "none",
    borderRadius: "24px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "1.08rem",
    letterSpacing: "0.01em",
    boxShadow: "0 2px 8px 0 rgba(31,38,135,0.06)",
    transition: "background 0.2s, color 0.2s"
  },
  okButton: { backgroundColor: "#6366f1", color: "white" },
  cancelButton: { backgroundColor: "#ef4444", color: "white" },
  closeCircle: {
    position: "absolute",
    top: "18px",
    right: "22px",
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background: "rgba(99,102,241,0.10)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    cursor: "pointer",
    fontSize: "22px",
    color: "#6366f1",
    transition: "background 0.2s, color 0.2s"
  }
};

const CustomAlert = ({ type = "info", title, message, onClose, onConfirm, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0 && type !== "info") {
      const timer = setTimeout(() => handleClose(), duration);
      return () => clearTimeout(timer);
    }
  }, [duration, type]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose && onClose(), 300);
  };

  const handleConfirm = () => {
    setIsVisible(false);
    setTimeout(() => onConfirm && onConfirm(true), 300);
  };

  const handleCancel = () => {
    setIsVisible(false);
    setTimeout(() => onConfirm && onConfirm(false), 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.15)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.28 }}
            style={{ ...alertStyles.container, ...alertStyles[type] }}
          >
            <div style={{ textAlign: "center", width: "80%", margin: "0 auto" }}>
              <strong style={{ fontSize: "1.25rem", color: "#1e293b", fontWeight: 700 }}>{title}</strong>
              <p style={{ margin: "12px 0 0 0", color: "#334155", fontWeight: 500, fontSize: "1.08rem" }}>{message}</p>
            </div>

            {type === "info" && (
              <div style={alertStyles.buttonContainer}>
                <button style={{ ...alertStyles.button, ...alertStyles.okButton }} onClick={handleConfirm}>
                  Yes
                </button>
                <button style={{ ...alertStyles.button, ...alertStyles.cancelButton }} onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            )}

            {!onConfirm && (
              <button onClick={handleClose} style={alertStyles.closeCircle}>
                ×
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CustomAlert;
