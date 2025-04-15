import { useState } from "react";

const useForm = (initialValue) => {
  const [form, setForm] = useState(initialValue);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setForm({
      ...form,
      [name]: value,
    });
  };

  return [form, handleChange];
};

export default useForm;