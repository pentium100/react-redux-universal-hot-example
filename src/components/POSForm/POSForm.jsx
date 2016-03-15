import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {reduxForm} from 'redux-form';
import * as POSActions from 'redux/modules/pos';

@connect(
  state => ({
    saveError: state.widgets.saveError
  }),
  dispatch => bindActionCreators(POSActions, dispatch)
)
@reduxForm({
  form: 'widget',
  fields: ['id', 'name', 'bank', 'desc']
  // ,validate: POSValidation
})
export default class WidgetForm extends Component {
  static propTypes = {
    fields: PropTypes.object.isRequired,
    editStop: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    invalid: PropTypes.bool.isRequired,
    pristine: PropTypes.bool.isRequired,
    save: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
    saveError: PropTypes.object,
    formKey: PropTypes.string.isRequired,
    values: PropTypes.object.isRequired
  };

  render() {
    const { editStop, fields: {id, name, bank, desc}, formKey, handleSubmit, invalid,
    pristine, save, submitting, saveError: { [formKey]: saveError }, values } = this.props;
    const styles = require('containers/POS/pos.scss');
    return (
      <tr className={submitting ? styles.saving : ''}>
        <td className={styles.idCol}>{id.value}</td>
        <td className={styles.nameCol}>
          <input type="text" className="form-control" {...name}/>
          {name.error && name.touched && <div className="text-danger">{name.error}</div>}
        </td>
        <td className={styles.bankCol}>
          <input type="text" className="form-control" {...bank}/>
          {bank.error && bank.touched && <div className="text-danger">{bank.error}</div>}
        </td>
        <td className={styles.descCol}>
          <input type="text" className="form-control" {...desc}/>
          {desc.error && desc.touched && <div className="text-danger">{desc.error}</div>}
        </td>
        <td className={styles.buttonCol}>
          <button className="btn btn-default"
                  onClick={() => editStop(formKey)}
                  disabled={submitting}>
            <i className="fa fa-ban"/> Cancel
          </button>
          <button className="btn btn-success"
                  onClick={handleSubmit(() => save(values)
                    .then(result => {
                      if (result && typeof result.error === 'object') {
                        return Promise.reject(result.error);
                      }
                    })
                  )}
                  disabled={pristine || invalid || submitting}>
            <i className={'fa ' + (submitting ? 'fa-cog fa-spin' : 'fa-cloud')}/> Save
          </button>
          {saveError && <div className="text-danger">{saveError}</div>}
        </td>
      </tr>
    );
  }
}
