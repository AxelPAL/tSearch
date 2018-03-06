import React from 'react';
import Autosuggest from 'react-autosuggest';
import searchFrom from '../models/searchForm';
import {observer} from 'mobx-react';
const debug = require('debug')('SearchFrom');
const qs = require('querystring');

import searchFormStyle from '../../css/searchForm.less';

@observer class SearchForm extends React.Component {
  constructor(props) {
    super();

    this.store = props.store || searchFrom.create({});

    this.handleChange = this.handleChange.bind(this);
    this.renderSuggestion = this.renderSuggestion.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleChange(e, {newValue}) {
    this.store.setQuery(newValue);
  }
  renderSuggestion(suggestion) {
    return (
      <span>{suggestion}</span>
    );
  }
  handleSubmit(e) {
    e.preventDefault();
    let url = 'index.html';
    if (this.store.query) {
      url += '#' + qs.stringify({
        query: this.store.query
      });
    }
    chrome.tabs.create({url: url});
  }
  render() {
    return (
      <div className="search-from">
        <form onSubmit={this.handleSubmit}>
          <Autosuggest
            theme={{
              input: 'input',
              suggestionsContainer: 'suggestions-container',
              suggestionsList: 'suggestions-list',
              suggestion: 'suggestion',
              suggestionHighlighted: 'suggestion--highlighted'
            }}
            suggestions={this.store.getSuggestions()}
            onSuggestionsFetchRequested={this.store.handleFetchSuggestions}
            onSuggestionsClearRequested={this.store.handleClearSuggestions}
            shouldRenderSuggestions={() => true}
            getSuggestionValue={suggestion => suggestion}
            renderSuggestion={this.renderSuggestion}
            inputProps={{
              type: 'search',
              placeholder: chrome.i18n.getMessage('searchPlaceholder'),
              value: this.store.query,
              onChange: this.handleChange,
              autoFocus: true
            }}
          />
          <button type="submit" className="submit">{chrome.i18n.getMessage('search')}</button>
        </form>
      </div>
    );
  }
}

export default SearchForm;