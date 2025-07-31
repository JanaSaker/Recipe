import { useState } from 'react';
import api from '../api/api';

function AddRecipe() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    image: null // For multer image upload
  });

  const handleChange = e => {
    const { name, value, files } = e.target;
    setForm(f => ({
      ...f,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    if (form.image) formData.append('image', form.image);

    try {
      await api.post('/recipes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Recipe added!');
    } catch (err) {
      alert('Error adding recipe.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" value={form.title} onChange={handleChange} placeholder="Title" required />
      <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" required />
      <input type="file" name="image" onChange={handleChange} />
      <button type="submit">Add Recipe</button>
    </form>
  );
}

export default AddRecipe;
