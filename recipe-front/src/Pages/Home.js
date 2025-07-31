import { useEffect, useState } from 'react';
import api from '../api/api';

function Home() {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    api.get('/recipes')
      .then(res => setRecipes(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div>
      <h2>All Recipes</h2>
      <ul>
        {recipes.map(recipe => (
          <li key={recipe.id}>
            <h4>{recipe.title}</h4>
            <p>{recipe.description}</p>
            {/* Add image, edit, delete buttons, etc. */}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;
