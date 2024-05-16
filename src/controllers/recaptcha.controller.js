
const request = require('request');

export const runCaptcha = async (req, res) => {

	if(!req.body.captcha){
		res.json({'msg': 'captcha token undefined'})
	}

	const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}$response=${req.body.captcha}`

	request(verifyUrl, (err,response, body) =>{
		if(err){
			console.log(err);
		}
		body = JSON.parse(body);

		if(!body.success || body.score < 0.4){
			return res.json({'msg': 'you might be a robot, sorry!! you are banned!', 'score':body.score});
		}

		return res.json({'msg': 'you have been verified! you may proceed', 'score': body.score});
	})
}