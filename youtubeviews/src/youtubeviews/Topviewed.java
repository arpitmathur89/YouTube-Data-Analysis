package youtubeviews;
import java.io.IOException;

import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.lib.input.TextInputFormat;
import org.apache.hadoop.mapreduce.lib.output.TextOutputFormat;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;
import org.apache.hadoop.fs.Path;

public class Topviewed {
	public static class Map extends Mapper<LongWritable, Text, Text,
	IntWritable> {

	       private Text video_name = new Text();
	       private  IntWritable views = new IntWritable();
	       public void map(LongWritable key, Text value, Context context )
	throws IOException, InterruptedException {
	           String line = value.toString();
	           String str[]=line.split(",");

	          if(str.length >= 5){
	                video_name.set(str[0]);
	                str[5]=str[5].replace("\"", "");
	                if(str[5].matches("\\d+")){ //this regular expression	specifies that the string should contain only integer values
	                	int temp=Integer.parseInt(str[5]); //typecasting string to Integer
	                	views.set(temp);
	                }
	          }

	      context.write(video_name, views);
	      }

	    }
	public static class Reduce extends Reducer<Text, IntWritable,
	Text, IntWritable> {

		    public void reduce(Text key, Iterable<IntWritable> values, Context context)
		      throws IOException, InterruptedException {
		        int sum = 0;
		        for (IntWritable val : values) {
		            sum += val.get();
		        }
		        context.write(key, new IntWritable(sum));
		    }
	 }

		 @SuppressWarnings("deprecation")
		 public static void main(String[] args) throws Exception {
		    Configuration conf = new Configuration();
		    Job job = new Job(conf, "videorating");
		    job.setJarByClass(Topviewed.class);
		    job.setMapOutputKeyClass(Text.class);
		    job.setMapOutputValueClass(IntWritable.class);
		    job.setOutputKeyClass(Text.class);
		    job.setOutputValueClass(IntWritable.class);
		    job.setMapperClass(Map.class);
		    job.setReducerClass(Reduce.class);
		    job.setInputFormatClass(TextInputFormat.class);
		    job.setOutputFormatClass(TextOutputFormat.class);
		    FileInputFormat.addInputPath(job, new Path(args[0]));
		    FileOutputFormat.setOutputPath(job, new Path(args[1]));
		    job.waitForCompletion(true);
		 }
}
