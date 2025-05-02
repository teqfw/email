# @teqfw/email: releases

## 0.26.0 – TODO

- A new config parameter to prevent actual email sending during development.

## 0.25.0 – Email headers support

- Introduced support for custom email headers.

## 0.24.0 - Change structure of template  folders hierarchy

- Change structure of template folders hierarchy.
- Enhance locale-based template path handling.

## 0.23.0 - Template Management and Email Sending Enhancements

* Added dynamic template loading and rendering service (`TeqFw_Email_Back_Service_Load`).
* Implemented template-based email preparation and sending service (`TeqFw_Email_Back_Service_Send`).
* Introduced metadata support for email templates (`TeqFw_Email_Back_Dto_Tmpl_Meta`).
* Enhanced path composition for email template localization (`TeqFw_Email_Back_Service_Load_A_PathsComposer`).
* Added tests for email template loading and path generation.
* Updated `package.json` with new dependencies for email handling.

## 0.22.0

* Remove the `TeqFw_Email_Back_Process_Email` module.

## 0.21.0

* Add the `TeqFw_Email_Back_Act_Send` action.
* Improve the local config DTOs.
* Change the `*.mjs` extensions to the `*.js`.

## 0.20.0

* These changes are related to the new architecture of the `@teqfw/di` package.

## 0.1.0

* Initial release.