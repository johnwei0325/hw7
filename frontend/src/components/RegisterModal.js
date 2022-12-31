import {Modal, Form, Input} from 'antd'


const RegisterModal = ({open, onCreate, onCancel }) => {
    const [form] = Form.useForm();
    return (
      <Modal
        open={open}
        title="Create a new account"
        okText="Register"
        cancelText="Cancel"
        onCancel={onCancel}
        onOk={() => { form.validateFields()
          .then((values) => {
            form.resetFields();
            onCreate(values);
            console.log(values)
          })
          .catch((e) => {
            window.alert(e);
          });}}
      >
        <Form form={form} layout="vertical"
            name="form_in_modal">
          <Form.Item 
            name="name"
            label="Name"
            rules={[
              {
                required: true,
                message: 'Error: Please enter name!',
              },
            ]}>
            <Input />
          </Form.Item>
          <Form.Item 
            name="password"
            label="Password"
            rules={[
              {
                required: true,
                message: 'Error: Please enter password!',
              },
            ]}>
            <Input type = "password" />
          </Form.Item>
        </Form>
      </Modal>
  )}

  export default RegisterModal