import AddCircleIcon from '@mui/icons-material/AddCircle';
import SearchIcon from '@mui/icons-material/Search'
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import { useState } from 'react';
import RemoveCircleRoundedIcon from '@mui/icons-material/RemoveCircleRounded';
import '../pages/CreateRecipePage.css' // need to separate out css
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
    const params = new URLSearchParams(location.search);
    const name = params.get("name");
    const date = params.get("date");
    const meal = params.get("meal");
    

    // const [addedIngredients, setAddedIngredients] = useState<Ingredient[]>([
    //     {name: "Mock", measurement: 0, measurementClassification: "mock", classification: "mock", caloriesPerMeasurement: 0 }
    // ])


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

    const handleAddIngredient = (ingredients: Ingredient) => (
      setAddedIngredients((prev) => 
        prev.some((item) => item.name == ingredients.name)
      ? prev.filter((item) => item.name !== ingredients.name )
      : [...prev, ingredients]
        // [...addedIngredients, ingredients])
    ))

    return (
        <section className="search-area-component">
            <section className="ingredients">
                    <div className="ingredients-header">
                    <h2 id="ingredients-heading">Ingredients</h2>
                    </div>
                    
                    <ul className={`list-of-ingredients ${addedIngredients.length != 0 ? "active" : ""}`}>
                        {addedIngredients.map((ingredients) => (
                        <li key={ingredients.name}>
                            <div className="listed-item" >
                            <span>{ingredients.name} : </span>
                            <div className="input-amount-and-unit">
                            <input
                                id="ingredient-amount"
                                placeholder="1"
                                type="number"
                                onChange={(e) => {
                                    const value = Number(e.target.value)

                                    setAddedIngredients((prev) =>
                                    prev.map((i) =>
                                        i.name === ingredients.name
                                        ? { ...i, amount: value }
                                        : i
                                    )
                                    )
                                }}
                                />
                                

                                <span>{ingredients.measurementClassification}</span>
                                </div>
                                <span className="calculated-calories">{ingredients.measurement * ingredients.caloriesPerMeasurement} cals</span>
                            </div>
                            <button className="remove-ingredient-button" onClick={() => (handleRemoveIngredient(ingredients.name))}>
                                <RemoveCircleRoundedIcon className="remove-icon" fontSize='medium'></RemoveCircleRoundedIcon>
                            </button>
                        </li>
                        
                    ))}
                    </ul>
                    
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
                                <div onClick={() => handleAddIngredient(ingredient)} key={ingredient.name} className={`whole-item ${addedIngredients.some((i) => (i.name == ingredient.name)) ? "added" : ""}`}>
                                <div className='item' >
                                <span>{ingredient.name}</span>
                                <div className="amount-and-unit">
                                    <span>{ingredient.caloriesPerMeasurement} cals / {ingredient.measurement}</span>
                                </div>
                                
                                    <button type="button" aria-label={addedIngredients.some((item)=> item.name === ingredient.name) ? "Remove item" : "Add item"} id="add-ingredient" onClick={(e) => {e.stopPropagation(); handleAddIngredient(ingredient);}} >
                                    {addedIngredients.some((item)=> item.name === ingredient.name) ? 
                                    
                                    <RemoveCircleIcon aria-hidden="true" fontSize='medium'/> : 
                                    <AddCircleIcon aria-hidden="true" fontSize='medium'/>  
                                    }
                                    </button>
                                
                                </div>
                                
                                </div>
                            ))}
                        </div>
                        
                    </div>
                    
                </section>
          
          
          )
   }