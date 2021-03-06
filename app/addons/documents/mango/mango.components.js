// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy of
// the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations under
// the License.

import app from "../../../app";
import FauxtonAPI from "../../../core/api";
import React, { Component } from 'react';
import Stores from "./mango.stores";
import Actions from "./mango.actions";
import ReactComponents from "../../components/react-components";
import IndexResultActions from "../index-results/actions";
import "../../../../assets/js/plugins/prettify";
import ReactSelect from "react-select";

var mangoStore = Stores.mangoStore;
var getDocUrl = app.helpers.getDocUrl;

var PaddedBorderedBox = ReactComponents.PaddedBorderedBox;
var CodeEditorPanel = ReactComponents.CodeEditorPanel;
var ConfirmButton = ReactComponents.ConfirmButton;

var MangoQueryEditorController = React.createClass({
  getInitialState: function () {
    return this.getStoreState();
  },

  getStoreState: function () {
    return {
      queryCode: mangoStore.getQueryFindCode(),
      database: mangoStore.getDatabase(),
      history: mangoStore.getHistory()
    };
  },

  onChange: function () {
    this.setState(this.getStoreState());
  },

  componentDidUpdate: function () {
    prettyPrint();
  },

  componentDidMount: function () {
    prettyPrint();
    mangoStore.on('change', this.onChange, this);
  },

  componentWillUnmount: function () {
    mangoStore.off('change', this.onChange);
  },

  getMangoEditor: function () {
    return this.refs.mangoEditor;
  },

  render: function () {
    if (this.state.isLoading) {
      return (
        <div className="mango-editor-wrapper">
          <ReactComponents.LoadLines />
        </div>
      );
    }

    return (
      <MangoEditor
        ref="mangoEditor"
        description={this.props.description}
        dbName={this.state.database.id}
        onSubmit={this.runQuery}
        title={this.props.editorTitle}
        docs={getDocUrl('MANGO_SEARCH')}
        exampleCode={this.state.queryCode}
        onExplainQuery={this.runExplain}
        history={this.state.history}
        onHistorySelected={this.historySelected}
        />
    );
  },

  notifyOnQueryError: function() {
    if (this.getMangoEditor().hasErrors()) {
      FauxtonAPI.addNotification({
        msg:  'Please fix the Javascript errors and try again.',
        type: 'error',
        clear: true
      });

      return true;
    }
    return false;
  },

  runExplain: function(event) {
    event.preventDefault();

    if (this.notifyOnQueryError()) {
      return;
    }

    Actions.runExplainQuery({
      database: this.state.database,
      queryCode: this.getMangoEditor().getEditorValue()
    });
  },

  runQuery: function (event) {
    event.preventDefault();

    if (this.notifyOnQueryError()) {
      return;
    }

    IndexResultActions.runMangoFindQuery({
      database: this.state.database,
      queryCode: this.getMangoEditor().getEditorValue()
    });
  },

  historySelected: function(selectedItem) {
    this.getMangoEditor().setEditorValue(selectedItem.value);
  }
});

var MangoEditor = React.createClass({
  render: function () {
    return (
      <div className="mango-editor-wrapper">
        <form className="form-horizontal" onSubmit={this.props.onSubmit}>
          <div className="padded-box">
            <ReactSelect
                className="mango-select"
                options={this.props.history}
                ref="history"
                placeholder="Query history"
                searchable={false}
                clearable={false}
                autosize={false}
                onChange={this.props.onHistorySelected}
                />
          </div>
          <PaddedBorderedBox>
            <CodeEditorPanel
              id="query-field"
              ref="field"
              title={this.props.title}
              docLink={this.props.docs}
              defaultCode={this.props.exampleCode} />
          </PaddedBorderedBox>
          <div className="padded-box">
            <div className="controls-group">
              <button type="submit" id="create-index-btn" className="btn btn-primary btn-space">Run Query</button>
              <button type="button" id="explain-btn" className="btn btn-secondary btn-space" onClick={this.props.onExplainQuery}>Explain</button>
              <a className="edit-link" href={'#' + FauxtonAPI.urls('mango', 'index-app', encodeURIComponent(this.props.dbName))}>manage indexes</a>
            </div>
          </div>
        </form>
      </div>
    );
  },

  setEditorValue: function (value) {
    return this.getEditor().setValue(value);
  },

  getEditorValue: function () {
    return this.refs.field.getValue();
  },

  getEditor: function () {
    return this.refs.field.getEditor();
  },

  hasErrors: function () {
    return this.getEditor().hasErrors();
  }
});

var MangoIndexEditor = React.createClass({
  render: function () {
    return (
      <div className="mango-editor-wrapper">
        <form className="form-horizontal" onSubmit={this.props.onSubmit}>
          <div className="padded-box">
            <ReactSelect
                className="mango-select"
                options={this.props.templates}
                ref="templates"
                placeholder="Examples"
                searchable={false}
                clearable={false}
                autosize={false}
                onChange={this.props.onTemplateSelected}
                />
          </div>
          <PaddedBorderedBox>
            <CodeEditorPanel
              id="query-field"
              ref="field"
              title={this.props.title}
              docLink={this.props.docs}
              defaultCode={this.props.exampleCode} />
          </PaddedBorderedBox>
          <div className="padded-box">
            <div className="control-group">
              <ConfirmButton text="Create index" id="create-index-btn" showIcon={false} />
              <a className="edit-link" href={'#' + FauxtonAPI.urls('mango', 'query-app', encodeURIComponent(this.props.dbName))}>edit query</a>
            </div>
          </div>
        </form>
      </div>
    );
  },

  setEditorValue: function (value) {
    return this.getEditor().setValue(value);
  },

  getEditorValue: function () {
    return this.refs.field.getValue();
  },

  getEditor: function () {
    return this.refs.field.getEditor();
  },

  hasErrors: function () {
    return this.getEditor().hasErrors();
  }
});

var MangoIndexEditorController = React.createClass({
  getInitialState: function () {
    return this.getStoreState();
  },

  getStoreState: function () {
    return {
      queryIndexCode: mangoStore.getQueryIndexCode(),
      database: mangoStore.getDatabase(),
      templates: mangoStore.getQueryIndexTemplates()
    };
  },

  onChange: function () {
    this.setState(this.getStoreState());
  },

  componentDidMount: function () {
    mangoStore.on('change', this.onChange, this);
  },

  componentWillUnmount: function () {
    mangoStore.off('change', this.onChange);
  },

  getMangoEditor: function () {
    return this.refs.mangoIndexEditor;
  },

  templateSelected: function(selectedItem) {
    this.getMangoEditor().setEditorValue(selectedItem.value);
  },

  render: function () {
    return (
      <MangoIndexEditor
        ref="mangoIndexEditor"
        description={this.props.description}
        dbName={this.state.database.id}
        onSubmit={this.saveIndex}
        title="Index"
        docs={getDocUrl('MANGO_INDEX')}
        templates={this.state.templates}
        onTemplateSelected={this.templateSelected}
        exampleCode={this.state.queryIndexCode} />
    );
  },

  saveIndex: function (event) {
    event.preventDefault();

    if (this.getMangoEditor().hasErrors()) {
      FauxtonAPI.addNotification({
        msg:  'Please fix the Javascript errors and try again.',
        type: 'error',
        clear: true
      });
      return;
    }

    Actions.saveIndex({
      database: this.state.database,
      queryCode: this.getMangoEditor().getEditorValue()
    });
  }
});

class ExplainPage extends Component {
  componentDidMount () {
    prettyPrint();
  };

  componentDidUpdate () {
    prettyPrint();
  };

  render () {

    return (
      <div>
        <pre className="prettyprint">{JSON.stringify(this.props.explainPlan, null, ' ')}</pre>
      </div>
    );
  };
}

ExplainPage.propTypes = {
  explainPlan: React.PropTypes.object.isRequired
};

export default {
  MangoIndexEditorController: MangoIndexEditorController,
  MangoQueryEditorController: MangoQueryEditorController,
  ExplainPage: ExplainPage
};
