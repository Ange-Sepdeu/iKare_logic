import moment from 'moment';
export const generateString = (length = 6) => {
    const characters = '0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}
function uploadFile(type) {
    console.log(type);
}
export const mailMessages = (type, data) => {
    let str = ''
    let msg;
    if (data.accountType != 'Personnel') {
        msg = 'you requested the creation of your account on our platform'
    } else {
        msg = 'Your Account been created on the IAI-SMS platform'
    }
    switch (type) {
        case 'forgot-password':
            str += `<center><div style="background-color: #adf6d7; padding: 10px;">
    <img src="https://ci4.googleusercontent.com/proxy/wzjI4ST1WfMLRoOdBG5ZCAR5oBkC-ammIW6DRVdEfRypkRlulaUlINnyB5832HGMjb_nOTK0fOPYtz49vMdgmlbDax9COgKDEd1yrbS4iK4gZt--0zX_7w=s0-d-e1-ft#http://iaicameroun.com/wp-content/uploads/2018/03/iai-logo-web-ok.png" /><br>
    <h2 style="font-size: 18px;">IAI-CAMEROUN | AICS-CAMEROON</h2>
    <h3 style="">Student Registration Portal</h3>
    <p style=""><b>${data.accountType},</b>, you requested the creation of your account on our platform</p>
    <p style="">Please enter <b style = "color:red;">${data.verificationCode}</b> in the app to verify your email address and complete the signup process</p>.
   <p style=""> This code <b style = "color:red;">expires in 1 hour</b></p>
   <a style="text-decoration: none;" href="#"><input style="height: 35px; width: 100px; border-radius: 20px; border: none;" type="submit" value="click me"></a><br><br>
   <div style=" margin-top: 5px;">
      <a style="text-decoration: none;" href="#"><img style=" height: 35px;" src="https://cdn-icons-png.flaticon.com/512/3488/3488290.png" /></a>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a style="text-decoration: none;" href="#"><img style=" height: 25px;" src="https://ci4.googleusercontent.com/proxy/UfEI_ysH9BLT_fW_Kxgk7t7rR2c0zavY6czooZvuRomDkbKv-cK_GL_4EeSDm8EnZsci3N9nW-PTUcXCnSD7X1VEkLhm54VunFFAGR7YxjG9Z75tm62FjXxMeHb7k2yytM3nXVA4NLf0LWSiBYw5fRapdUUAV_g=s0-d-e1-ft#https://d3k81ch9hvuctc.cloudfront.net/company/pLHCMh/images/75918f86-4d54-47f7-9e63-c0231bc13396.png"/></a>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a style="text-decoration: none;" href="#"><img style=" height: 25px;" src="https://ci4.googleusercontent.com/proxy/_Ngc2A6Y3qlJ4iH-87wSLKwHTMY6CrESvFiCTciDcYNhaxqs7G7DbTpoLVPMISNt2qApf9bkw_rfNT_XjH_iHM3QubLISqd32wQp_RzNHijA23SovBbwMnYlGNLi2TRe2jbRMFXFsgMzs1T1P_0EtSgSwmTzMAU=s0-d-e1-ft#https://d3k81ch9hvuctc.cloudfront.net/company/pLHCMh/images/aeed5956-20cd-45b0-a29c-19a4bf32087b.png"/></a>
   </div>
</div></center>`
            break;
        case 'create-account':
            str += `<center><div style="background-color: #adf6d7; padding: 10px;">
    <img src="https://www.concourscameroon.com/wp-content/uploads/2021/04/IAI.jpg" style="border-radius:15px;height:95px;width:100px;box-shadow: rgba(50, 50, 93, 0.25) 0px 30px 60px -12px inset, rgba(0, 0, 0, 0.3) 0px 18px 36px -18px inset;" /><br>
    <h2 style="font-size: 18px;">IAI-CAMEROUN | AICS-CAMEROON</h2>
    <h3 style="">${data.accountType} Registration Portal</h3>
    <p style=""><b>Dear ${data.accountType}</b>, ${msg}</p>
    <p style="">Please enter <b style = "color:red;">${data.verificationCode}</b> in the app to verify your email address and complete the signup process</p>.
    <p style=""> This code <b style = "color:red;">expires in 1 hour</b></p>
   <a style="text-decoration: none;" href="#"><input style="height: 35px; width: 100px; border-radius: 20px; border: none;" type="submit" value="click me"></a><br><br>
   <div style=" margin-top: 10px;">
      <a style="text-decoration: none;" href="#"><img style=" height: 25px;" src="https://cdn-icons-png.flaticon.com/512/889/889147.png" /></a>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a style="text-decoration: none;" href="#"><img style=" height: 25px;" src="https://cdn-icons-png.flaticon.com/512/5968/5968764.png"/></a>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a style="text-decoration: none;" href="#"><img style=" height: 25px;" src="https://cdn-icons-png.flaticon.com/512/733/733558.png"/></a>
   </div>
</div></center>`
            break;
        case 'registration-success':
            str += `<center><div style="background-color: #adf6d7; padding: 10px;">
        <img src="https://www.concourscameroon.com/wp-content/uploads/2021/04/IAI.jpg" style="border-radius:15px;height:95px;width:100px;box-shadow: rgba(50, 50, 93, 0.25) 0px 30px 60px -12px inset, rgba(0, 0, 0, 0.3) 0px 18px 36px -18px inset;" /><br>
        <h2 style="font-size: 18px;">IAI-CAMEROUN | AICS-CAMEROON</h2>
        <h3 style="">Candidate Registration Portal</h3>
        <p>
        <b>Dear Candidate</b>, you have sucessfully registered for the up comming Entrance Examinations
        <br /><br /> Exam Session : <b style = "color:red;">${data.sessionName}</b>.
        <br /><br /> Field of Study : <b style = "color:red;">${data.field}</b>.
        <br /><br /> Examination Date : <b style = "color:red;">${data.dateOfConcour}</b> .
        <br /><br /> Examination Center Selected : <b style = "color:red;">${data.center}</b>.
        </p>        
       
       <a style="text-decoration: none;" href="#"><input style="height: 35px; width: 100px; border-radius: 20px; border: none;" type="submit" value="click me"></a><br><br>
       <div style=" margin-top: 10px;">
          <a style="text-decoration: none;" href="#"><img style=" height: 25px;" src="https://cdn-icons-png.flaticon.com/512/889/889147.png" /></a>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a style="text-decoration: none;" href="#"><img style=" height: 25px;" src="https://cdn-icons-png.flaticon.com/512/5968/5968764.png"/></a>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a style="text-decoration: none;" href="#"><img style=" height: 25px;" src="https://cdn-icons-png.flaticon.com/512/733/733558.png"/></a>
       </div>
    </div></center>`
            break;
        case 'candidate-validated':
            console.log(data);
            str += `<center><div style="background-color: #adf6d7; padding: 10px;">
            <img src="https://www.concourscameroon.com/wp-content/uploads/2021/04/IAI.jpg" style="border-radius:15px;height:95px;width:100px;box-shadow: rgba(50, 50, 93, 0.25) 0px 30px 60px -12px inset, rgba(0, 0, 0, 0.3) 0px 18px 36px -18px inset;" /><br>
            <h2 style="font-size: 18px;">IAI-CAMEROUN | AICS-CAMEROON</h2>
            <h3 style="">Candidate Registration Portal</h3>
            <p>
            <b>Dear Candidate</b>, you have accepted to take part for the up comming Entrance Examinations
            <br /><br /> Exam Session : <b style = "color:red;">${data.sessionName}</b>.
            <br /><br /> Field of Study : <b style = "color:red;">${data.field}</b>.
            <br /><br /> Examination Date : <b style = "color:red;">${moment(data.dateOfConcour).format('DD MMMM YYYY')}</b> .
            <br /><br /> Examination Center Selected : <b style = "color:red;">${data.center}</b>.
            </p>        
           
           <a style="text-decoration: none;" href="#"><input style="height: 35px; width: 100px; border-radius: 20px; border: none;" type="submit" value="click me"></a><br><br>
           <div style=" margin-top: 10px;">
              <a style="text-decoration: none;" href="#"><img style=" height: 25px;" src="https://cdn-icons-png.flaticon.com/512/889/889147.png" /></a>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a style="text-decoration: none;" href="#"><img style=" height: 25px;" src="https://cdn-icons-png.flaticon.com/512/5968/5968764.png"/></a>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a style="text-decoration: none;" href="#"><img style=" height: 25px;" src="https://cdn-icons-png.flaticon.com/512/733/733558.png"/></a>
           </div>
        </div></center>`
            break;
        case 'create-personnel':
            str += `<center><div style="background-color: #adf6d7; padding: 10px;">
    <img src="https://www.concourscameroon.com/wp-content/uploads/2021/04/IAI.jpg" style="border-radius:15px;height:95px;width:100px;box-shadow: rgba(50, 50, 93, 0.25) 0px 30px 60px -12px inset, rgba(0, 0, 0, 0.3) 0px 18px 36px -18px inset;" /><br>
    <h2 style="font-size: 18px;">IAI-CAMEROUN | AICS-CAMEROON</h2>
    <h3 style="">Welcome To AICS </h3>
    <p>
    <b>Dear ${data.name} </b>, welcome to the AICS family.This is your connection password to access the school platform ,which you can later modify
    <br /><br /> Connection Password: <b style = "color:red;">${data.randomPassword}</b>.
    </p>        
   
   <a style="text-decoration: none;" href="#"><input style="height: 35px; width: 100px; border-radius: 20px; border: none;" type="submit" value="click me"></a><br><br>
   <div style=" margin-top: 10px;">
      <a style="text-decoration: none;" href="#"><img style=" height: 25px;" src="https://cdn-icons-png.flaticon.com/512/889/889147.png" /></a>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a style="text-decoration: none;" href="#"><img style=" height: 25px;" src="https://cdn-icons-png.flaticon.com/512/5968/5968764.png"/></a>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a style="text-decoration: none;" href="#"><img style=" height: 25px;" src="https://cdn-icons-png.flaticon.com/512/733/733558.png"/></a>
   </div>
</div></center>`
            break;
        case 'update-Account-Type-Candidate':
            str += `<center><div style="background-color: #adf6d7; padding: 10px;">
        <img src="https://www.concourscameroon.com/wp-content/uploads/2021/04/IAI.jpg" style="border-radius:15px;height:95px;width:100px;box-shadow: rgba(50, 50, 93, 0.25) 0px 30px 60px -12px inset, rgba(0, 0, 0, 0.3) 0px 18px 36px -18px inset;" /><br>
        <h2 style="font-size: 18px;">IAI-CAMEROUN | AICS-CAMEROON</h2>
        <h3 style="">Welcome To AICS </h3>
        <p>
        <b>Dear ${data.name} </b>, You have been accepted to participate in the competititive entrance examination into AICS.
        <br /><br /> Concours Session: <b style="color:red;">${data.concour.dateOfConcour}</b>.
    </p>
       <a style="text-decoration: none;" href="#"><input style="height: 35px; width: 100px; border-radius: 20px; border: none;" type="submit" value="click me"></a><br><br>
       <div style=" margin-top: 10px;">
          <a style="text-decoration: none;" href="#"><img style=" height: 25px;" src="https://cdn-icons-png.flaticon.com/512/889/889147.png" /></a>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a style="text-decoration: none;" href="#"><img style=" height: 25px;" src="https://cdn-icons-png.flaticon.com/512/5968/5968764.png"/></a>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a style="text-decoration: none;" href="#"><img style=" height: 25px;" src="https://cdn-icons-png.flaticon.com/512/733/733558.png"/></a>
       </div>
    </div></center>`
            break;
        case 'rejected-Account':
            str += `<center><div style="background-color: #adf6d7; padding: 10px;">
        <img src="https://www.concourscameroon.com/wp-content/uploads/2021/04/IAI.jpg" style="border-radius:15px;height:95px;width:100px;box-shadow: rgba(50, 50, 93, 0.25) 0px 30px 60px -12px inset, rgba(0, 0, 0, 0.3) 0px 18px 36px -18px inset;" /><br>
        <h2 style="font-size: 18px;">IAI-CAMEROUN | AICS-CAMEROON</h2>
        <h3 style="">Welcome To AICS </h3>
        <p>
        <b>Dear ${data.name} </b>, you demande to participle to the concour session have be rejected.
        <br /><br /> reason:${data.message}.`
            for (const key in data.urls) {
                if (!data.urls[key]) {
                    str += `<div>
                        <label>${key}</label>
                        <input type="file" name="image" />
                        <button onClick="${uploadFile(key)}">Upload file</button>
                    </div>`
                }
            }

            str += `</p>
       <a style="text-decoration: none;" href="#"><input style="height: 35px; width: 100px; border-radius: 20px; border: none;" type="submit" value="click me"></a><br><br>
       <div style=" margin-top: 10px;">
          <a style="text-decoration: none;" href="#"><img style=" height: 25px;" src="https://cdn-icons-png.flaticon.com/512/889/889147.png" /></a>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a style="text-decoration: none;" href="#"><img style=" height: 25px;" src="https://cdn-icons-png.flaticon.com/512/5968/5968764.png"/></a>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a style="text-decoration: none;" href="#"><img style=" height: 25px;" src="https://cdn-icons-png.flaticon.com/512/733/733558.png"/></a>
       </div>
    </div></center>`
            break;


        default:
            str += 'Welcome To Campus IAI'
            break;
    }

    return str;
}

export const checkIfSocketIdExist = (arr, value) => {
    const data = arr.filter((item) => item.socketId === value)
    if (data.length > 0)
        return true
    else
        return false
}
