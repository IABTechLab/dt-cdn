package com.iabtechlab.digitrust.test.Integration;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.WebDriverWait;

import static org.junit.jupiter.api.Assertions.*;

import java.io.IOException;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.TakesScreenshot;

public class SearchForDigitrustTests {
	  private String baseUrl;
	  private WebDriver driver;
//	  private ScreenshotHelper screenshotHelper;
	  
	  @BeforeAll
	  public void openBrowser() {
	    baseUrl = System.getProperty("webdriver.base.url");
	    driver = new ChromeDriver();
	    driver.get(baseUrl);
//	    screenshotHelper = new ScreenshotHelper();
	  }
	  
	  @AfterAll
	  public void saveScreenshotAndCloseBrowser() throws IOException {
//	    screenshotHelper.saveScreenshot("screenshot.png");
	    driver.quit();
	  }
	  

	  @Test
	  public void pageTitleAfterSearchShouldBeginWithDigi() throws IOException {
	    assertEquals("The page title should equal Google at the start of the test.", "Google", driver.getTitle());
	    WebElement searchField = driver.findElement(By.name("q"));
	    searchField.sendKeys("digit");
	    searchField.submit();
	    
	    WebDriverWait wait = new WebDriverWait(driver, 10);
	    Object objResult = wait.until(new ExpectedCondition() {
			@Override
			public Object apply(Object drv) {
				WebDriver d = (WebDriver)drv;
				return d.getTitle().toLowerCase().startsWith("digitr");
			}	    
	    });
	    
//	    assertTrue("Title has something", objResult);
	    
	  }
}
