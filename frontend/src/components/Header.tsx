import Button from "@mui/material/Button"
import type { ComponentType, Dispatch, SetStateAction } from "react"
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import { Link } from 'react-router-dom'
import './Header.css'

type HeaderProps = {
    isSidebarOpen: boolean,
    setIsSidebarOpen: Dispatch<SetStateAction<boolean>>,
    pageTitle: string,
    pageIntro?: string,
    pageButton?: React.ReactNode
}

type SecondaryHeaderProps = {
    isSidebarOpen: boolean,
    setIsSidebarOpen: Dispatch<SetStateAction<boolean>>,
    pageTitle: string,
    linkBack: string
}

export function Header({isSidebarOpen, setIsSidebarOpen, pageTitle, pageIntro='', pageButton=null}: HeaderProps){
    return (
        <header className="dashboard-page__header">
          <div className="dashboard-page__header-copy">
            <button
              type="button"
              className="dashboard-page__menu-button"
              onClick={() => setIsSidebarOpen((open) => !open)}
              aria-expanded={isSidebarOpen}
              aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <span aria-hidden="true">{isSidebarOpen ? 'Hide' : 'Menu'}</span>
            </button>

            <p className="dashboard-page__eyebrow">Family Fridge</p>
            <h1>{pageTitle}</h1>
            {pageIntro.length != 0 && <p className="dashboard-page__intro">{pageIntro}</p>}
           
           
          </div>
           {pageButton}

 
        </header>
    )
    
}

export function SecondaryHeader({isSidebarOpen, setIsSidebarOpen, pageTitle, linkBack}: SecondaryHeaderProps){
  return(
    <header className="recipe-detail-page__header">
            <button
              type="button"
              className="dashboard-page__menu-button"
              onClick={() => setIsSidebarOpen((open) => !open)}
              aria-expanded={isSidebarOpen}
              aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <span aria-hidden="true">{isSidebarOpen ? 'Hide' : 'Menu'}</span>
            </button>
             <div className="back-button">

                <Link to={linkBack} aria-label="Back">
                  <ArrowBackIosIcon className="back-icon"></ArrowBackIosIcon>
                </Link>
               

            </div>
            <div className="recipe-title__container">
             
            
              <h1 className="recipe-title">{pageTitle}</h1>
            </div>
            
        </header>

  )

}