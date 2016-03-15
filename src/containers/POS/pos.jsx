import React, {Component, PropTypes } from 'react';
import {connect} from 'react-redux';
import {initialize, changeWithKey} from 'redux-form';
// import 'bootstrap-sass';
import {ButtonToolbar, Button} from 'react-bootstrap';
import ApiClient from 'helpers/ApiClient';

import POSForm from 'components/POSForm/POSForm';
@connect((state) => ({
  posData: state.widgets.posData,
  editing: state.widgets.editing,
  error: state.widgets.error,
  loading: state.widgets.loading
}), {initialize, changeWithKey})
export default class POS extends Component {

  static propTypes = {
    posData: PropTypes.array,
    error: PropTypes.string,
    loading: PropTypes.bool,
    initializeWithKey: PropTypes.func.isRequired,
    editing: PropTypes.object.isRequired,
    load: PropTypes.func.isRequired,
    editStart: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.client = new ApiClient();
  }

  componentWillMount() {
  }

  newPOS() {

  }

  handleSubmitPOS() {


  }

  closeModal() {


  }

  editData() {

  }


  pageChange(page, size) {
    console.log(page);
    console.log(size);
  }
  deletePOS() {

  }
  render() {
    const handleEdit = (widget) => {
      const {editStart} = this.props; // eslint-disable-line no-shadow
      return () => editStart(String(widget.id));
    };
    const styles = require('./pos.scss');
    const {posData, error, editing} = this.props;
    return (
      <div>
        <h1>POS清单</h1>
        <ButtonToolbar className="buttonToolbar">
          <Button bsStyle="primary" bsSize="xsmall" onClick={this.newPOS.bind(this)}>新增POS</Button>
          <Button bsStyle="danger" bsSize="xsmall" onClick={this.deletePOS.bind(this)}>删除POS</Button>
        </ButtonToolbar>
        {error &&
        <div className="alert alert-danger" role="alert">
          <span className="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>
          {' '}
          {error}
        </div>}
        {posData && posData.length &&
        <table className="table table-striped">
          <thead>
          <tr>
            <th className={styles.idCol}>ID</th>
            <th className={styles.nameCol}>NAME</th>
            <th className={styles.bankCol}>Bank</th>
            <th className={styles.descCol}>Desc.</th>
            <th className={styles.buttonCol}></th>
          </tr>
          </thead>
          <tbody>
          {
            posData.map((pos) => editing[pos.id] ?
              <POSForm formKey={String(pos.id)} key={String(pos.id)} initialValues={pos}/> :
              <tr key={pos.id}>
                <td className={styles.idCol}>{pos.id}</td>
                <td className={styles.nameCol}>{pos.name}</td>
                <td className={styles.bankCol}>{pos.bank}</td>
                <td className={styles.descCol}>{pos.desc}</td>
                <td className={styles.buttonCol}>
                  <button className="btn btn-primary" onClick={handleEdit(pos)}>
                    <i className="fa fa-pencil"/> Edit
                  </button>
                </td>
              </tr>)
          }
          </tbody>
        </table>}

      </div>
    );
  }
}
