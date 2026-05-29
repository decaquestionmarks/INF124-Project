import AddCircleIcon from '@mui/icons-material/AddCircle';
import SearchIcon from '@mui/icons-material/Search'
import { useState } from 'react';
import RemoveCircleRoundedIcon from '@mui/icons-material/RemoveCircleRounded';
// import '../pages/CreateRecipePage.css' // need to separate out css
import './SearchFood.css' 

type Ingredient = {
  "name": string;
  "measurement": number;
  "measurementClassification": string;
  "classification": string;
  "caloriesPerMeasurement": number;
}

type SearchFoodProps = {
  addedIngredients: Ingredient[];
  setAddedIngredients: React.Dispatch<React.SetStateAction<Ingredient[]>>;
};

export function SearchFood({addedIngredients, setAddedIngredients}: SearchFoodProps){
    const [searchInput, setSearchInput] = useState('')
    const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>([])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      setSearchInput(input);
      setFilteredIngredients([])
    }

    const handleRemoveIngredient = (name: string) => {
        setAddedIngredients((prev) =>
            prev.filter((item) => item.name !== name)
        );
        };

    const handleAddIngredient = (ingredient: Ingredient) => {
        setAddedIngredients(prev => {
            const alreadyExists = prev.some(
            item => item.name === ingredient.name
            );
            return (alreadyExists ? prev : [...prev, ingredient])
        });
        };

    const addedSet = new Set(
        addedIngredients.map(i => i.name)
)

    return (
        <section className="search-area-component">
            <section className="search-food-ingredients">
                {
                <div className="search-food-detail-item">
                <h2>Ingredients</h2>
                <div className="search-food-ingredients-text">
                  {addedIngredients.length != 0 ? addedIngredients.map((f, i) => (
                    <div key={i} className="search-food-ingredient-item">
                      <div className="search-food-food-item">
                        <span>{f.name}</span>
                        <div className="search-food-input-and-amount">
                            <input type="text" value={f.measurement}  onChange={(e) => {
                                const newValue = Number(e.target.value);

                                setAddedIngredients(prev =>
                                prev.map(item =>
                                    item.name === f.name
                                    ? { ...item, measurement: newValue }
                                    : item
                                )
                                );
                            }}/>
                            <span>{f.measurementClassification}</span>
                        </div>
                        <button className="delete-ingredient-button" aria-label="Remove ingredient" onClick={() => handleRemoveIngredient(f.name)}>
                            <RemoveCircleRoundedIcon className="delete-ingredient-icon" aria-hidden="true" fontSize='medium'/>
                        </button>
                      </div>
                     
                     <div>random</div>
                      
                      
                    
                    </div>
                    
                  )) :  
                   <div className="ingredient-item">
                      <p>Mock Ingredient - 1 unit</p>
                      <p className="missing-item">Missing Item!</p>
                    </div>
                    
                  
                 }
                  </div>
                </div>
                }
                    
                </section>
            <div className="search-area">
                        <div className="search-form">
                            <SearchIcon aria-hidden="true" className="search-icon"></SearchIcon>
                            <input onChange={handleInputChange} aria-label="Search for ingredients" type="search" placeholder="Search for Ingredients" className="search-bar" />
                        </div>
                        <div className={`matched-items ${filteredIngredients.length != 0  || searchInput != "" ? "active" : ""}`} aria-live="polite">
                            {filteredIngredients.length == 0 && searchInput != "" ?
                            <p>No ingredients found</p> 
                            : filteredIngredients.map((ingredient) => (
                                <div onClick={() => handleAddIngredient(ingredient)} key={ingredient.name} className={`whole-item ${addedSet.has(ingredient.name) ? "added" : ""}`}>
                                <div className='item' >
                                <span>{ingredient.name}</span>
                                <div className="amount-and-unit">
                                    <span>{ingredient.caloriesPerMeasurement} cals / {ingredient.measurement}</span>
                                </div>
                                
                                    <button type="button" aria-label={addedSet.has(ingredient.name) ? "Remove item" : "Add item"} id="add-ingredient" onClick={(e) => {e.stopPropagation(); handleAddIngredient(ingredient);}} >
                                    {addedSet.has(ingredient.name) ?
                                    "" : 
                                    <AddCircleIcon aria-hidden="true" fontSize='medium'/>  
                                    }
                                    </button>
                                
                                </div>
                                
                                </div>
                            ))}
                        </div>
                        <div></div>
                    </div>     
                </section>
          
          
          )
   }