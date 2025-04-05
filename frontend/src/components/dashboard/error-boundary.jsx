import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Mettre à jour l'état pour afficher l'UI de secours
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Vous pouvez aussi enregistrer l'erreur dans un service de rapport d'erreurs
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Vous pouvez personnaliser l'UI de secours ici
      return (
        <div className="error-container">
          <h2>Quelque chose s'est mal passé.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            <summary>Plus de détails</summary>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
          <button onClick={() => window.location.reload()}>
            Rafraîchir la page
          </button>
        </div>
      );
    }

    // Si pas d'erreur, rendre les enfants normalement
    return this.props.children;
  }
}

export default ErrorBoundary;