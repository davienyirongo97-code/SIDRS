/**
 * src/components/ui/Modal.js
 * ─────────────────────────────────────────────
 * Reusable modal dialog wrapper.
 *
 * Usage:
 *   <Modal title="Register Device" onClose={handleClose}>
 *     <div className="modal-body">...</div>
 *     <div className="modal-footer">...</div>
 *   </Modal>
 *
 * - Clicking the dark overlay closes the modal (calls onClose)
 * - Press Escape key also closes it
 * - wide prop makes it wider (680px instead of 520px)
 */

import React, { useEffect } from 'react';

export default function Modal({ title, onClose, children, wide = false }) {

  // Close on Escape key
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        // Only close when clicking the dark backdrop, not the modal box itself
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className={`modal-box${wide ? ' wide' : ''}`}>
        {/* Sticky header with title and close button */}
        <div className="modal-header">
          <h2 className="modal-title" id="modal-title">{title}</h2>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Modal content (body + footer passed as children) */}
        {children}
      </div>
    </div>
  );
}
