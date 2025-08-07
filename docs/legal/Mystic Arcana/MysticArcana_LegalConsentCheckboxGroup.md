// components/LegalConsentCheckboxGroup.tsx
export const LegalConsentCheckboxGroup = ({ values, onChange }) => (

  <div className="space-y-3 text-sm text-gray-700 dark:text-gray-200">
    <label>
      <input type="checkbox" value="terms" checked={values.terms} onChange={onChange} />
      &nbsp; I agree to the Terms & Conditions
    </label>
    <label>
      <input type="checkbox" value="privacy" checked={values.privacy} onChange={onChange} />
      &nbsp; I agree to the Privacy Policy
    </label>
    <label>
      <input type="checkbox" value="disclaimer" checked={values.disclaimer} onChange={onChange} />
      &nbsp; I have read and understand the Disclaimer
    </label>
  </div>
)
