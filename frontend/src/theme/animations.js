import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Enregistrer les plugins GSAP
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Animations de base
export const fadeInUp = (element, delay = 0) => {
  return gsap.from(element, {
    opacity: 0,
    y: 20,
    duration: 0.6,
    delay,
    ease: "power2.out"
  });
};

// Animations pour les formulaires immobiliers
export const formAnimations = {
  // Animation d'entrée des champs de formulaire
  fieldEntrance: (element, index) => {
    return gsap.from(element, {
      opacity: 0,
      x: index % 2 === 0 ? -20 : 20,
      duration: 0.4,
      delay: index * 0.1,
      ease: "back.out(1.2)"
    });
  },

  // Animation de focus sur un champ
  fieldFocus: (element) => {
    return gsap.to(element, {
      scale: 1.02,
      duration: 0.2,
      boxShadow: "0 0 0 2px rgba(255, 199, 38, 0.5)",
      ease: "power2.out"
    });
  },

  // Animation de validation réussie
  successValidation: (element) => {
    return gsap.to(element, {
      backgroundColor: "#F0FDF4",
      borderColor: "#22C55E",
      duration: 0.3,
      ease: "power2.out"
    });
  },

  // Animation d'erreur
  errorShake: (element) => {
    return gsap.to(element, {
      x: [-5, 5, -5, 5, 0],
      duration: 0.5,
      backgroundColor: "#FEF2F2",
      borderColor: "#EF4444",
      ease: "power1.out"
    });
  },

  // Animation de soumission du formulaire
  formSubmit: (formElement, callback) => {
    return gsap.to(formElement, {
      opacity: 0.8,
      y: 10,
      duration: 0.3,
      onComplete: callback
    });
  },

  // Animation de réinitialisation
  formReset: (formElement) => {
    return gsap.fromTo(formElement, 
      { opacity: 0.5, y: -20 },
      { opacity: 1, y: 0, duration: 0.4 }
    );
  }
};

// Animations spécifiques aux composants immobiliers
export const propertyAnimations = {
  cardEntrance: (element) => {
    return gsap.from(element, {
      opacity: 0,
      y: 30,
      duration: 0.5,
      stagger: 0.1,
      scrollTrigger: {
        trigger: element,
        start: "top 90%"
      }
    });
  },
  cardHover: (element) => {
    return gsap.to(element, {
      y: -5,
      duration: 0.3,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
      ease: "power2.out"
    });
  }
};

// Animation pour les prix
export const priceAnimation = {
  pulse: (element) => {
    return gsap.to(element, {
      scale: 1.05,
      duration: 0.8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  },
  
  // Nouvelle animation pour les changements de prix
  priceChange: (element, isIncrease) => {
    return gsap.to(element, {
      color: isIncrease ? "#22C55E" : "#EF4444",
      scale: 1.2,
      duration: 0.5,
      yoyo: true,
      repeat: 1,
      ease: "power2.out"
    });
  }
};

// Initialisation des animations globales
export const initGlobalAnimations = () => {
  if (typeof window === 'undefined') return;

  // Animation des sections
  gsap.utils.toArray('section').forEach((section, i) => {
    fadeInUp(section, i * 0.1);
  });

  // Animation des cartes propriétés
  const propertyCards = gsap.utils.toArray('.property-card');
  propertyCards.forEach((card, i) => {
    propertyAnimations.cardEntrance(card, i * 0.1);
  });

  // Animation des champs de formulaire
  const formFields = gsap.utils.toArray('.form-field, .chakra-input, .chakra-select, .chakra-textarea');
  formFields.forEach((field, i) => {
    formAnimations.fieldEntrance(field, i);
  });

  // Gestion des événements de formulaire
  formFields.forEach(field => {
    field.addEventListener('focus', () => formAnimations.fieldFocus(field));
    field.addEventListener('blur', () => gsap.to(field, { scale: 1, duration: 0.2 }));
  });
};

// Export des animations pour utilisation dans les composants
export default {
  fadeInUp,
  formAnimations,
  propertyAnimations,
  priceAnimation,
  initGlobalAnimations
};