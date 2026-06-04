# GCPS-R Bilingual Web App Plan

## Overview
A bilingual (English/Hebrew) web application for administering the Graded Chronic Pain Scale-Revised (GCPS-R) questionnaire.

## Core Features
- **Bilingual Interface**: Toggle between English and Hebrew (RTL support).
- **Touch-Optimized Inputs**:
    - **Questions 1 & 2**: 4-choice button selection.
    - **Questions 3, 4, & 5**: 0-10 sliders with large handles for finger operation.
- **Auto-Scrolling**: The page automatically scrolls to the next question as the patient provides answers.
- **Calculated Results**:
    - **PEG Total**: Q3 + Q4 + Q5 (0-30).
    - **PEG Average**: (Q3 + Q4 + Q5) / 3 (0-10).
    - **GCPS-R Grade**: 0-3 based on frequency and impact.

## Scoring Algorithm
1. **PEG Score**:
    - Total = Q3 + Q4 + Q5.
    - Average = Total / 3.
2. **GCPS-R Grade**:
    - **Grade 0**: Chronic pain absent. (Q1 is "Never" or "Some days").
    - **Grade 3**: High impact chronic pain. (Q1 is "Most days" or "Every day" AND Q2 is "Most days" or "Every day").
    - **Grade 2**: Bothersome chronic pain. (Q1 is "Most/Every day", Q2 is "Never/Some days", and PEG Total >= 12).
    - **Grade 1**: Mild chronic pain. (Q1 is "Most/Every day", Q2 is "Never/Some days", and PEG Total < 12).

## Technical Stack
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Icons**: Lucide React

## Implementation Steps
1. **Scaffold**: Initialize React/Tailwind project.
2. **i18n**: Implement bilingual dictionary.
3. **Components**: Develop `ChoiceQuestion`, `SliderQuestion`, and `ScoreDisplay`.
4. **UX**: Implement auto-scrolling and RTL layout logic.
5. **Finalize**: Build and verify.
