# Nutrition Tracker

Nutrition Tracker is a family-centered nutrition and meal management application concept being developed for INF 124. The project combines food logging, calorie and macro tracking, shared household organization, recipe discovery, and personalized recommendations into a single experience. Instead of making users jump between separate apps for nutrition, groceries, recipes, and family coordination, this project aims to bring those workflows together in one place.

## Project Status

This repository is currently in the planning and design phase. The materials we have so far include:

- A feature brainstorm and scope list
- A sitemap for the main navigation and page structure
- Low-fidelity wireframes for key screens
- A use case diagram showing user actions and external system interactions

There is no full implementation in this repository yet. This README documents the current product direction and planned scope.

## Problem Statement

People who want to eat healthier often have to manage several disconnected tasks:

- Tracking meals, calories, and nutrients
- Keeping inventory of food at home
- Planning what to cook with ingredients they already have
- Coordinating groceries and meals across a household
- Adjusting food choices to match personal goals

Most apps solve only one part of this problem. Nutrition Tracker is designed to connect all of these tasks through a shared, family-friendly platform.

## Vision

The goal of Nutrition Tracker is to help individuals and families make better food decisions with less effort. The app is intended to support:

- Daily calorie, macro, and micronutrient awareness
- Shared household food management through a family fridge and shopping list
- Recipe creation, recipe search, and recipe suggestions based on available foods
- Goal-based recommendations tailored to personal needs and preferences
- Convenient food input through receipt or barcode scanning

## Core Product Concept

At a high level, the app centers around five connected areas:

1. Authentication and onboarding
2. Nutrition tracking
3. Family fridge and shopping list management
4. Recipe discovery and creation
5. User account and family management

These sections are reflected in the current sitemap and wireframes.

## Target Users

### Individual Users

Users who want to:

- Track meals and calories
- Monitor macros and micronutrients
- Set nutrition goals
- Find recipes that fit their preferences
- Use ingredients they already have at home

### Families and Shared Households

Households that want to:

- Maintain a shared fridge inventory
- Collaborate on a shopping list
- Coordinate food usage
- Share nutrition goals or meal ideas

### Family Admins

A family admin manages shared access and can:

- Invite users to a family account
- Remove users from the family account
- Help maintain shared household data

## Proposed Feature Set

The current idea list includes the following functionality:


- Family account system
- Family shopping cart / shopping list
- Family fridge
- Food tracker
- Macro, calorie, and micronutrient tracking
- Recipe finder
- User-made recipes
- Recipe suggestion
- Receipt scanner
- Barcode scanner
- Nearby stores
- Notifications for low food
- Social sharing for recipes and nutrition goals

## MVP Scope

Based on the current notes, the items marked with `*` are being treated as the most important early features for the first usable version of the product:

- Receipt scanning
- Food tracking
- Macro, calorie, and micronutrient visibility
- Recipe creation
- Recipe finding
- Family fridge
- Shopping list

These features form the core value of the app: helping users understand what they eat, what food they have, and what they can do next.

## Stretch or Expanded Features

The following features appear to be planned as secondary or extended functionality after the core experience is working:

- Recipe suggestions and recommendations
- Barcode Scanning
- Nearby store discovery
- Notifications for low food inventory
- Social media sharing
- More advanced personalization based on user preferences and goals

## Main Navigation and Sitemap

The current sitemap shows the following main pages:

- Login Page
- Sign Up
- Dashboard
- Fridge
- Cal Tracking
- Recipes
- Account

Some of the planning materials also show `Nearby Stores` as either a recipe-related subfeature or its own navigation destination. At the moment, it should be treated as part of the planned experience, with final placement still to be decided.

### Fridge Section

Current planned actions within the fridge flow include:

- Scan receipt
- Add items to the family fridge
- Add items to the shopping list
- View food stored in the household fridge

### Calorie Tracking Section

Current planned actions within calorie tracking include:

- Track breakfast, lunch, dinner, and snacks
- Review daily calorie totals
- Review macro information
- Edit or delete meal entries

### Recipes Section

Current planned actions within recipes include:

- View recipe suggestions
- Search recipes
- Add new recipes
- View individual recipe pages
- Share recipes
- View nearby stores related to recipe ingredients

### Account Section

Current planned actions within account include:

- Edit goals and user information
- Invite users to the family account
- Remove users from the family account

## Current Screen Direction

The wireframes suggest a desktop-first dashboard layout with a left-side navigation rail and dedicated content area for each major workflow.

### Authentication

The current design includes:

- A sign-in page
- A sign-up page
- Simple email and password entry
- Clear links between registration and login

### Dashboard

The dashboard appears to act as the home screen after login and includes:

- A welcome message
- Quick navigation to major sections
- Recent recipes for fast access

### Fridge

The fridge view is currently designed to show:

- A shared family fridge inventory
- A quick action for receipt scanning
- A shopping list panel
- Item/category organization for household food tracking

### Calorie Tracking

The calorie tracking page is currently designed around:

- Daily progress
- Goal, eaten, and remaining values
- Meal-based sections such as breakfast, lunch, dinner, and snacks
- Add-food entry points
- Macro summaries

### Recipe Experience

The recipe flow currently includes:

- Recommended recipes
- User-created recipes
- Recipe search
- An individual recipe detail page with ingredients and directions
- The ability to add a recipe to calorie tracking

### Account and Family Management

The account page currently includes space for:

- Goal management
- Profile or user information
- Family membership management

## Key Use Cases

The use case diagram shows the following primary actions for a standard user:

- Create an account
- Log in to an account
- Add food to the fridge or scan a receipt
- Add items to the shopping list
- View food in the fridge
- Create and view goals
- View nearby store stock
- View consumed calories
- Create recipes
- View suggested recipes
- Search recipes
- Edit or delete meals
- Track meals

Additional family admin actions include:

- Invite users to a family account
- Remove users from a family account

The diagrams also suggest integration with external systems for:

- Saving user-created recipes in a database
- Serving recipe requests
- Recommending recipes
- Pulling recipe-related information from external data sources
- Sharing posts to social media

## Personalized Recommendation Concept

One of the more unique parts of this project is the recommendation system. The app is intended to go beyond passive tracking by suggesting recipes and food choices based on:

- Foods already tracked in the fridge
- User goals
- Nutrition needs
- Personal preferences
- Possibly nearby store availability

This gives the project a stronger decision-support angle instead of acting only as a food log.

## Household Collaboration Concept

The family account system expands the app from an individual tracker into a shared household platform. In the current design, the family-oriented functionality includes:

- A shared family fridge
- A shared shopping list
- Admin controls for inviting and removing members
- Common visibility into food availability

This feature set makes the project useful not only for health tracking, but also for grocery planning and reducing food waste.

## What Makes This Project Distinct

The current concept stands out because it combines:

- Nutrition tracking
- Inventory management
- Recipe management
- Household collaboration
- Goal-based personalization

Many existing tools cover only one or two of these areas. Nutrition Tracker aims to connect them into one continuous experience:

1. Food enters the system through scanning or manual entry
2. Food becomes part of the family fridge or shopping workflow
3. Meals are tracked against nutrition goals
4. Recipes are suggested or created from available ingredients
5. Users make better decisions based on goals, inventory, and recommendations

## Possible Data Requirements

Although the technical stack has not been finalized in this repository, the current feature set implies the need for data models such as:

- Users
- Families
- Family memberships and roles
- Fridge items
- Shopping list items
- Recipes
- Recipe ingredients
- Meal logs
- Nutrition goals
- Nutrition summaries

It may also require external integrations for:

- Barcode or receipt scanning
- Nutrition data lookup
- Recipe search or recommendation data
- Nearby store information
- Social media sharing

## Non-Functional Goals

From the current design direction, the product should prioritize:

- Ease of use for repeated daily tasks
- Clear nutrition information at a glance
- Fast food entry
- Simple collaboration for families
- A clean workflow between tracking, inventory, and recipes

## Suggested Next Steps

The next logical steps for the project would be:

1. Define the primary user flow from sign-in to daily use
2. Create a data model for users, meals, recipes, and family inventory
3. Decide how receipt/barcode scanning and nutrition lookup will work
4. Turn the wireframes into higher-fidelity designs
5. Choose the implementation stack and begin development

## Summary

Nutrition Tracker is currently scoped as a smart, family-aware nutrition platform that helps users track meals, manage household food, discover recipes, and work toward personal goals. The concept already has a strong planning foundation through feature ideation, a sitemap, wireframes, and use cases. The next phase is to turn that design direction into a focused MVP and implementation plan.
